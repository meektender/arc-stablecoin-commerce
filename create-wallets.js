require('dotenv').config();
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');

async function main() {
    // 1. We must pass BOTH the API Key and the Entity Secret to initialize properly
    const client = initiateDeveloperControlledWalletsClient({
        apiKey: process.env.CIRCLE_API_KEY,
        entitySecret: process.env.CIRCLE_ENTITY_SECRET
    });

    try {
        console.log("⏳ Spawning a new developer-controlled Wallet Set...");

        const walletSetResponse = await client.createWalletSet({
            name: "Arc Remittance Pack"
        });

        const walletSetId = walletSetResponse.data?.walletSet?.id;
        
        if (!walletSetId) {
            throw new Error("Wallet set creation failed: no ID returned from Circle.");
        }

        console.log(`✅ Wallet Set Created! ID: ${walletSetId}`);
        console.log("⏳ Initializing Arc Testnet addresses...");

        // 2. We request 2 wallets explicitly on the ARC-TESTNET as required by the SDK
        const walletsResponse = await client.createWallets({
            walletSetId: walletSetId,
            blockchains: ["ARC-TESTNET"],
            count: 2,
            accountType: "EOA" // Externally Owned Account (Standard Web3 Wallet)
        });

        const wallets = walletsResponse.data?.wallets;

        console.log("\n🚀 WALLETS DEPLOYED SUCCESSFULLY:\n");
        wallets.forEach((wallet, index) => {
            console.log(` Wallet #${index + 1} [${wallet.blockchain}]`);
            console.log(` ID: ${wallet.id}`);
            console.log(` Address: ${wallet.address}`);
            console.log(` Status: ${wallet.state}\n -----------------------------------------`);
        });

        console.log("💡 Next step: Head over to the faucet to drop some test funds into these addresses!");

    } catch (error) {
        console.error("\n❌ Wallet Deployment Failed:");
        console.error(error.response?.data || error.message);
    }
}

main();