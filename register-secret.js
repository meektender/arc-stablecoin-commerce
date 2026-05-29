require('dotenv').config();
const { registerEntitySecretCiphertext } = require('@circle-fin/developer-controlled-wallets');

async function main() {
    try {
        console.log("⏳ Submitting registration protocol to Circle Sandbox...");
        
        // This securely encrypts and registers your secret with Circle's servers
        const response = await registerEntitySecretCiphertext({
            apiKey: process.env.CIRCLE_API_KEY,
            entitySecret: process.env.CIRCLE_ENTITY_SECRET
        });

        console.log("\n🎉 EXCELLENT! YOUR ENTITY SECRET IS NOW REGISTERED.");
        console.log("--------------------------------------------------");
        console.log("Recovery File Status Code:", response.status);
        console.log("\n💡 This completely clears the error. You can now safely generate wallets!");
    } catch (error) {
        console.error("\n❌ Registration Failed:");
        console.error(error.response?.data || error.message);
    }
}

main();