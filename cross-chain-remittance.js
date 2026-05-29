require('dotenv').config();
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');
const crypto = require('crypto');

async function main() {
    const client = initiateDeveloperControlledWalletsClient({
        apiKey: process.env.CIRCLE_API_KEY,
        entitySecret: process.env.CIRCLE_ENTITY_SECRET
    });

    try {
        console.log("✈️ Initializing Ultra-Low-Fee Cross-Border Remittance Engine...");

        const idempotencyKey = crypto.randomUUID();

        // Exact match with your workspace's developer-controlled-wallets parameter schema
        const response = await client.createTransaction({
            idempotencyKey: idempotencyKey,
            walletId: "ddd168ff-0766-54bc-8609-e33e45445ca9",
            blockchain: "ARC-TESTNET", // Mission Target Network
            destinationAddress: "0xd20dbecca5b821397b75ad12acc6558a6edb0b40", 
            amounts: ["5.00"], 
            fee: {
                type: "level",
                config: {
                    feeLevel: "MEDIUM"
                }
            },
            // Mission Component: Deploying Cross-Border Payout Value via verified Asset ID
            tokenId: "ef87c8c3-85de-598a-af50-c5135eecfa74" 
        });

        const tx = response.data?.transaction;

        console.log("\n🌐 STABLECOIN REMITTANCE ROUTE INITIATED SUCCESSFULLY!");
        console.log("--------------------------------------------------");
        console.log(`Execution Network:  ${tx?.blockchain || 'ARC-TESTNET'}`);
        console.log(`Transaction ID:     ${tx?.id || 'Pending broadcast'}`);
        console.log(`Current State:      ${tx?.state || 'Processing'}`);
        console.log(`Idempotency Key:    ${idempotencyKey}`);

    } catch (error) {
        console.error("\n❌ Remittance Routing Failed:");
        if (error.response?.data) {
            console.error(JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

main();