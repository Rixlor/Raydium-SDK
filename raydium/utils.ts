import { Connection, PublicKey } from "@solana/web3.js";
import { Liquidity, MARKET_STATE_LAYOUT_V3 } from "@raydium-io/raydium-sdk";
import { Commitment } from "@solana/web3.js";

const getPoolId = async (connection: Connection, baseMint: PublicKey, quoteMint: PublicKey): Promise<PublicKey | null> => {
    // Define generateV4PoolInfo

    const fetchMarketId = async (connection: Connection, baseMint: PublicKey, quoteMint: PublicKey, commitment: Commitment) => {
        try {
            const accounts = await connection.getProgramAccounts(
                new PublicKey('srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX'),
                {
                    commitment,
                    filters: [
                        { dataSize: MARKET_STATE_LAYOUT_V3.span },
                        {
                            memcmp: {
                                offset: MARKET_STATE_LAYOUT_V3.offsetOf("baseMint"),
                                bytes: baseMint.toBase58(),
                            },
                        },
                        {
                            memcmp: {
                                offset: MARKET_STATE_LAYOUT_V3.offsetOf("quoteMint"),
                                bytes: quoteMint.toBase58(),
                            },
                        },
                    ],
                }
            );
            return accounts.map(({ account }) => MARKET_STATE_LAYOUT_V3.decode(account.data))[0].ownAddress
        } catch (err) {
            return null
        }
    }

    const marketId = await fetchMarketId(connection, baseMint, quoteMint, 'confirmed')
    if (marketId) {
        const V4PoolInfo = await generateV4PoolInfo(baseMint, quoteMint, marketId)
        return V4PoolInfo.poolInfo.id
    }
    else {
        return null
    }
}

export { getPoolId }