# Raydium-SDK
The Raydium SDK enables developers to create a variety of Web3 tools integrated with Raydium

## Features
- 🔄 **Swap Functionality** – Buy and sell tokens using Raydium’s liquidity pools.
- ⚡ **High Performance** – Optimized for fast and efficient transactions.
- 🛠 **Developer-Friendly** – Simple API for seamless integration into Web3 apps.
- 🔌 **Raydium Integration** – Leverage Raydium’s ecosystem for trading and liquidity.

## Installation
To install the Raydium SDK, run:

```sh
npm install raydium-sdk
```

Or using Yarn:
```sh
yarn add raydium-sdk
```

## Swap Function: Buy Tokens(e.x.)
The SDK provides a buy function to swap tokens using Raydium’s liquidity pools. Below is an example implementation:

```ts
export const buy = async (poolId: PublicKey, outToken: PublicKey, wallet: Keypair, amount: number) => {
    try {
        const targetPoolInfo = await formatAmmKeysById(poolId.toBase58());
        const poolKeys = jsonInfo2PoolKeys(targetPoolInfo) as LiquidityPoolKeys;
        const poolInfo = await Liquidity.fetchInfo({ connection: connection, poolKeys });
        const slippage = new Percent(30, 100);
        const inputToken = Token.WSOL;
        const inputTokenAmount = new TokenAmount(inputToken, amount);
        const outputToken = new Token(TOKEN_PROGRAM_ID, outToken, 6);
        const inAta = getAssociatedTokenAddressSync(NATIVE_MINT, wallet.publicKey);
        const outAta = getAssociatedTokenAddressSync(outToken, wallet.publicKey);

        const { minAmountOut } = Liquidity.computeAmountOut({
            poolKeys,
            poolInfo,
            amountIn: inputTokenAmount,
            currencyOut: outputToken,
            slippage: slippage,
        });

        const { innerTransaction } = Liquidity.makeSwapFixedInInstruction(
            {
                poolKeys: poolKeys,
                userKeys: {
                    tokenAccountIn: inAta,
                    tokenAccountOut: outAta,
                    owner: wallet.publicKey
                },
                amountIn: amount,
                minAmountOut: minAmountOut.raw,
            },
            poolKeys.version,
        );

        const instructions: TransactionInstruction[] = [];
        instructions.push(
            ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }),
            createAssociatedTokenAccountIdempotentInstruction(wallet.publicKey, inAta, wallet.publicKey, NATIVE_MINT),
            createSyncNativeInstruction(inAta, TOKEN_PROGRAM_ID),
            createAssociatedTokenAccountIdempotentInstruction(wallet.publicKey, outAta, wallet.publicKey, outToken),
            ...innerTransaction.instructions,
            createCloseAccountInstruction(inAta, wallet.publicKey, wallet.publicKey)
        );

        const latestBlockhash = await connection.getLatestBlockhash('confirmed');
        const messageV0 = new TransactionMessage({
            payerKey: wallet.publicKey,
            recentBlockhash: latestBlockhash.blockhash,
            instructions: instructions
        }).compileToV0Message();

        const buyVTx = new VersionedTransaction(messageV0);
        buyVTx.sign([wallet]);

        return jitoSwapBundle([buyVTx], wallet);
    } catch (err) {
        return {
            confirmed: false
        };
    }
};

```

## Usage Example

Below is an example of how you can integrate the SDK into your application:

```ts
import { buy } from 'raydium-sdk';

const poolId = new PublicKey("POOL_ID_HERE");
const outToken = new PublicKey("TOKEN_ID_HERE");
const wallet = new Keypair();
const amount = 1_000_000; // Example amount in smallest token units

buy(poolId, outToken, wallet, amount)
    .then(response => {
        console.log("Swap Successful:", response);
    })
    .catch(error => {
        console.error("Swap Failed:", error);
    });

```

## Contributing

We welcome contributions! Feel free to submit pull requests or report issues.

## Contact

- Telegram: [@Rixlor](https://t.me/Rixlor)