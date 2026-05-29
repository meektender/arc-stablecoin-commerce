require('dotenv').config();
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');
const crypto = require('crypto');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
    const client = initiateDeveloperControlledWalletsClient({
        apiKey: process.env.CIRCLE_API_KEY,
        entitySecret: process.env.CIRCLE_ENTITY_SECRET
    });

    try {
        console.log("⚡ Initializing Multi-Chain CCTP Remittance Bridge to Arc Network...");

        const idempotencyKey = crypto.randomUUID();
        const tokenMessengerAddress = "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5"; 

        const response = await client.createContractExecutionTransaction({
            idempotencyKey: idempotencyKey,
            walletId: "ddd168ff-0766-54bc-8609-e33e45445ca9",
            blockchain: "ARC-TESTNET", 
            contractAddress: tokenMessengerAddress,
            abiFunctionSignature: "depositForBurn(uint256,uint32,bytes32,address)",
            abiParameters: [
                "5000000",                                      // Amount: 5.00 USDC (6 decimals)
                "6",                                            // Destination Domain (Arc Network Identity Code)
                "0x000000000000000000000000d20dbecca5b821397b75ad12acc6558a6edb0b40", // Target destination wallet address
                "0x3600000000000000000000000000000000000000"    // Target ERC20 contract token matching your token balance
            ],
            fee: {
                type: "level",
                config: {
                    feeLevel: "MEDIUM"
                }
            }
        });

        // FIXED: Extracting the actual root transaction tracking ID from the API data envelope
        const txId = response.data?.id || response.data?.transaction?.id;

        console.log("\n🌐 CCTP CROSS-CHAIN CONTRACT CALL INITIATED!");
        console.log("--------------------------------------------------");
        console.log(`Transaction Tracking ID: ${txId}`);
        console.log("--------------------------------------------------");
        
        if (!txId) {
            console.log("⚠️ No Transaction ID returned. Dumping raw data for inspection:");
            console.log(JSON.stringify(response.data, null, 2));
            return;
        }

        console.log("⏳ Entering real-time on-chain tracking loop...");
        let keepPolling = true;
        let attempts = 0;
        const maxAttempts = 15; 

        while (keepPolling && attempts < maxAttempts) {
            attempts++;
            await sleep(4000); 

            const statusCheck = await client.getTransaction({ id: txId });
            const tx = statusCheck.data?.transaction;

            console.log(`[Attempt ${attempts}] Current State: ${tx?.state || 'Processing'}`);

            if (tx?.state === 'COMPLETE') {
                console.log("\n🚀 CCTP TRANSACTION SUCCESSFUL AND FINALIZED ON-CHAIN!");
                console.log("--------------------------------------------------");
                console.log(`✅ Final Status:     ${tx?.state}`);
                console.log(`🔗 Blockchain Hash:  ${tx?.txHash || 'Hash Broadcasted'}`);
                console.log(`📅 Updated At:       ${tx?.updateDate}`);
                keepPolling = false;
            } else if (tx?.state === 'FAILED') {
                console.error("\n❌ Circle Pipeline Execution Failed on the ledger network.");
                keepPolling = false;
            }
        }

    } catch (error) {
        console.error("\n❌ CCTP Bridge Routine Failed:");
        if (error.response?.data) {
            console.error(JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

main();