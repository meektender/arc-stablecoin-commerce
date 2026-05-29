require('dotenv').config();
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');

async function main() {
    // 1. Initialize the Circle SDK client using our saved credentials
    const client = initiateDeveloperControlledWalletsClient({
        apiKey: process.env.CIRCLE_API_KEY
    });

    try {
        console.log("⏳ Fetching public key configuration from Circle...");
        
        // 2. Request Circle's server registration details
        const publicKeyResponse = await client.getPublicKey({});
        
        console.log("\n✅ SUCCESS! Connection Verified.");
        console.log("Circle Public Key Instance:", publicKeyResponse.data.publicKey);
        console.log("\nNext step: We use this to configure your developer layout.");
    } catch (error) {
        console.error("\n❌ Connection Error:");
        console.error(error.response?.data || error.message);
    }
}

main();