/**
 * SUMMO Printer Agent
 * Bridge between SUMMO Web App and Local Printer Hardware
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3030;

app.use(cors());
app.use(bodyParser.json());

// --- PATH COMPATIBILITY ---
// When running as a PKG executable, __dirname points to the internal snapshot.
// We want to store config and logs next to the .exe file.
const isPkg = typeof process.pkg !== 'undefined';
const BASE_PATH = isPkg ? path.dirname(process.execPath) : __dirname;
const LOG_FILE = path.join(BASE_PATH, 'summo-agent.log');

// Logging helper
function log(message) {
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] ${message}\n`;
    console.log(message);
    fs.appendFileSync(LOG_FILE, formatted);
}

process.on('uncaughtException', (err) => {
    log(`FATAL ERROR: ${err.message}\n${err.stack}`);
    if (isPkg) {
        console.log("\nO Agente encontrou um erro fatal e será fechado.");
        console.log("Verifique o arquivo 'summo-agent.log' para detalhes.");
        console.log("Pressione qualquer tecla para sair...");
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('data', process.exit.bind(process, 1));
    } else {
        process.exit(1);
    }
});

// --- CONFIGURATION ---
const CONFIG_PATH = path.join(BASE_PATH, 'config.json');
let config = {
    tenantId: 'default',
    defaultPrinter: '',
    paperWidth: '80mm',
    cloudSync: false
};

if (fs.existsSync(CONFIG_PATH)) {
    try {
        config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        log(`Loaded config from ${CONFIG_PATH}`);
    } catch (e) { log(`Error reading config.json: ${e.message}`); }
} else {
    log(`Config file not found at ${CONFIG_PATH}, using defaults.`);
}

const TEMP_DIR = path.join(BASE_PATH, 'temp_prints');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

// --- ROUTES ---

/**
 * Health check & Discovery
 */
app.get('/status', (req, res) => {
    res.json({
        status: 'ONLINE',
        version: '1.0.2',
        config: { tenantId: config.tenantId },
        platform: process.platform,
        timestamp: new Date()
    });
});

/**
 * Local Print Request
 */
app.post('/print', (req, res) => {
    try {
        const { content, type, options = {} } = req.body;
        const printerName = options.printerName || config.defaultPrinter;

        log(`Received print request: ${type} for printer: ${printerName || 'Default'}`);

        if (type === 'TEST') {
            printToHardware("================================\n   SUMMO TESTE DE IMPRESSÃO   \n================================\nAgente Ativo e Pronto!\nData: " + new Date().toLocaleString() + "\n================================\n", printerName);
            return res.json({ success: true, message: 'Test sent' });
        }

        const formattedContent = formatPrintContent(content, config.paperWidth);
        printToHardware(formattedContent, printerName);

        res.json({ success: true });
    } catch (err) {
        log(`POST /print Error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

/**
 * Get available printer names
 */
app.get('/printers', (req, res) => {
    exec('powershell "Get-Printer | Select-Object Name"', (err, stdout) => {
        if (err) {
            log(`Error getting printers: ${err.message}`);
            return res.status(500).json({ error: err.message });
        }
        const printers = stdout.split('\n')
            .map(line => line.trim())
            .filter(line => line && line !== 'Name' && !line.startsWith('----'));
        res.json({ printers });
    });
});

// --- CORE LOGIC ---

function formatPrintContent(content, width) {
    if (!content) return "";

    let processed = content
        .replace(/### (.*)/g, "--- $1 ---")
        .replace(/## (.*)/g, "=== $1 ===")
        .replace(/# (.*)/g, ">>> $1 <<<")
        .replace(/\*\*(.*)\*\*/g, "$1")
        .replace(/^- (.*)/g, " [ ] $1");

    return processed;
}

function printToHardware(content, printerName) {
    const fileName = `print_${Date.now()}.txt`;
    const filePath = path.join(TEMP_DIR, fileName);

    fs.writeFileSync(filePath, content, 'utf8');

    const command = printerName
        ? `powershell "Out-Printer -Name '${printerName}' -InputObject (Get-Content '${filePath}' -Raw)"`
        : `powershell "Out-Printer -InputObject (Get-Content '${filePath}' -Raw)"`;

    log(`Executing: ${command}`);

    exec(command, (err) => {
        if (err) {
            log(`Print Error: ${err.message}`);
            if (printerName) {
                log("Attempting fallback to default printer...");
                exec(`powershell "Out-Printer -InputObject (Get-Content '${filePath}' -Raw)"`);
            }
        }
        else log(`Success printing ${fileName}`);

        // Cleanup
        setTimeout(() => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }, 10000);
    });
}

const server = app.listen(PORT, () => {
    log(`========================================`);
    log(`   SUMMO PRINTER AGENT v1.0.2          `);
    log(`   Path: ${BASE_PATH}                  `);
    log(`   Status: OFFLINE MODE                `);
    log(`   Port: ${PORT}                       `);
    log(`========================================`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        log(`CRITICAL: Port ${PORT} is already in use.`);
    } else {
        log(`CRITICAL: Server failed to start: ${err.message}`);
    }
    process.exit(1);
});
