import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

// Resolve directories for serving static frontend files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enable cross-origin resource sharing and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serves our dashboard files locally

/**
 * Helper function to execute script files reliably and return logs to the UI
 * Uses --no-warnings to suppress modules conflicts during runtime execution
 */
function runScript(scriptName) {
    return new Promise((resolve, reject) => {
        // Using an explicit node flag forces the sub-process to handle commonJS seamlessly
        exec(`node --unhandled-rejections=strict ${scriptName}`, (error, stdout, stderr) => {
            if (error) {
                // If it fails due to module scope, we fall back to a dynamic wrapper execution
                exec(`node --input-type=commonjs -e "require('./${scriptName}')"`, (fallbackError, fallbackStdout, fallbackStderr) => {
                    if (fallbackError) {
                        resolve({ success: false, log: fallbackStderr || fallbackStdout || fallbackError.message });
                    } else {
                        resolve({ success: true, log: fallbackStdout });
                    }
                });
            } else {
                resolve({ success: true, log: stdout });
            }
        });
    });
}

// Endpoint 1: Fetch Current Wallet Balances
app.get('/api/balance', async (req, res) => {
    const result = await runScript('check-balance.js');
    if (result.success) {
        res.json({ success: true, log: result.log });
    } else {
        res.status(500).json({ success: false, error: result.log });
    }
});

// Endpoint 2: Execute Local UAE Remittance
app.post('/api/remit/local', async (req, res) => {
    // In a full production env, parameters from req.body would override static configurations
    const result = await runScript('send-remittance.js');
    if (result.success) {
        res.json({ success: true, log: result.log });
    } else {
        res.status(500).json({ success: false, error: result.log });
    }
});

// Endpoint 3: Execute Cross-Chain CCTP Bridge Remittance
app.post('/api/remit/cctp', async (req, res) => {
    const result = await runScript('cctp-bridge.js');
    if (result.success) {
        res.json({ success: true, log: result.log });
    } else {
        res.status(500).json({ success: false, error: result.log });
    }
});

// Root route to serve the visual dashboard interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialize Server listener
app.listen(PORT, () => {
    console.log(`\n🚀 Arc Stablecoin Commerce Stack UI Server Live!`);
    console.log(`🌐 Local dashboard address: http://localhost:${PORT}\n`);
});