const crypto = require('crypto');

// Generates a secure 32-byte (64-character) hex string
const secret = crypto.randomBytes(32).toString('hex');
console.log("\n🔑 YOUR NEW ENTITY SECRET:\n", secret, "\n");