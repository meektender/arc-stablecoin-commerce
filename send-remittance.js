require('dotenv').config();
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');
const crypto = require('crypto');

async function main() {
    const client = initiateDeveloperControlledWalletsClient({
        apiKey: process.env.CIRCLE_API_KEY,
        entitySecret: process.env.CIRCLE_ENTITY_SECRET
    });

    try {
        console.log("🚀 Initializing cross-border remittance transfer engine...");

        const idempotencyKey = crypto.randomUUID();

        // Standard direct method with flat configuration properties
        const response = await client.createTransaction({
            idempotencyKey: idempotencyKey,
            walletId: "ddd168ff-0766-54bc-8609-e33e45445ca9",
            blockchain: "ARC-TESTNET",
            destinationAddress: "0xd20dbecca5b821397b75ad12acc6558a6edb0b40", 
            amounts: ["5.00"], 
            fee: {
                type: "level",
                config: {
                    feeLevel: "MEDIUM"
                }
            },
            tokenId: "ef87c8c3-85de-598a-af50-c5135eecfa74" // FIXED: The exact, verified ERC20 USDC token ID
        });

        const tx = response.data?.transaction;

        console.log("\n⚡ REMITTANCE PIPELINE INITIATED SUCCESSFULLY!");
        console.log("--------------------------------------------------");
        console.log(`Transaction ID: ${tx?.id || 'Pending broadcast'}`);
        console.log(`Current State:  ${tx?.state || 'Processing'}`);
        console.log(`Idempotency:    ${idempotencyKey}`);

    } catch (error) {
        console.error("\n❌ Remittance Execution Failed:");
        if (error.response?.data) {
            console.error(JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

main();