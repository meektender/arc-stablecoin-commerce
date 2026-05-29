require('dotenv').config();
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');

async function main() {
    const client = initiateDeveloperControlledWalletsClient({
        apiKey: process.env.CIRCLE_API_KEY,
        entitySecret: process.env.CIRCLE_ENTITY_SECRET
    });

    // Make sure this matches your Wallet ID from your previous success screen!
    const targetWalletId = "ddd168ff-0766-54bc-8609-e33e45445ca9";

    try {
        console.log(`⏳ Querying on-chain balances for Wallet ID: ${targetWalletId}...`);

        // FIX: Changed from getWalletTokenBalances to getWalletTokenBalance
        const response = await client.getWalletTokenBalance({
            id: targetWalletId
        });

        // The SDK returns a single token balance object or list inside data
        const balances = response.data?.tokenBalances;

        console.log("\n💰 CURRENT WALLET BALANCES:");
        console.log("-----------------------------------------");
        
        if (!balances || balances.length === 0) {
            console.log(" Empty wallet or pending transaction. Go hit the faucet to claim testnet funds!");
        } else {
            balances.forEach((token) => {
                console.log(` Token: ${token.token.symbol}`);
                console.log(` Balance: ${token.amount}`);
                console.log(` Blockchain: ${token.token.blockchain}`);
                console.log("-----------------------------------------");
            });
        }

    } catch (error) {
        console.error("\n❌ Failed to retrieve balances:");
        console.error(error.response?.data || error.message);
    }
}

main();