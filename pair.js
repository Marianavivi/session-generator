import express from 'express';
import fs from 'fs';
import pino from 'pino';
import { 
    makeWASocket, 
    useMultiFileAuthState, 
    delay, 
    makeCacheableSignalKeyStore, 
    Browsers, 
    jidNormalizedUser 
} from '@whiskeysockets/baileys';
import { upload } from './mega.js';

const router = express.Router();

// Function to remove a file or directory
function removeFile(FilePath) {
    try {
        if (!fs.existsSync(FilePath)) return false;
        fs.rmSync(FilePath, { recursive: true, force: true });
    } catch (e) {
        console.error('Error removing file:', e);
    }
}

router.get('/', async (req, res) => {
    let num = req.query.number;
    let dirs = './' + (num || 'session');
    
    // Remove existing session if present
    await removeFile(dirs);

    // Function to initiate a session
    async function initiateSession() {
        const { state, saveCreds } = await useMultiFileAuthState(dirs);

        try {
            let GlobalTechInc = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.ubuntu('Chrome'),
            });

            if (!GlobalTechInc.authState.creds.registered) {
                await delay(2000);
                num = num.replace(/[^0-9]/g, '');
                const code = await GlobalTechInc.requestPairingCode(num);
                if (!res.headersSent) {
                    console.log({ num, code });
                    await res.send({ code });
                }
            }

            GlobalTechInc.ev.on('creds.update', saveCreds);
            GlobalTechInc.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection === "open") {
                    await delay(10000);
                    const sessionGlobal = fs.readFileSync(dirs + '/creds.json');

                    // Function to generate a random Mega file ID
                    function generateRandomId(length = 6, numberLength = 4) {
                        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                        let result = '';
                        for (let i = 0; i < length; i++) {
                            result += characters.charAt(Math.floor(Math.random() * characters.length));
                        }
                        const number = Math.floor(Math.random() * Math.pow(10, numberLength));
                        return `${result}${number}`;
                    }

                    // Upload session file to Mega
                    const megaUrl = await upload(fs.createReadStream(`${dirs}/creds.json`), `${generateRandomId()}.json`);
                    let stringSession = megaUrl.replace('https://mega.nz/file/', ''); // Extract session ID from URL
                    stringSession = 'Sparky~' + stringSession;  // Prepend your name to the session ID

                    // Send the session ID to the target number
                    const userJid = jidNormalizedUser(num + '@s.whatsapp.net');
                    await GlobalTechInc.sendMessage(userJid, { text: stringSession });

                    // Send confirmation message
                    await GlobalTechInc.sendMessage(userJid, { 
                        text: `
 *🔑 ABOVE IS YOUR SESSION ID.*
*🔧 USE IT TO DEPLOY YOUR BOT.*
╔═════◇
║ 『••• 🌟 𝗩𝗶𝘀𝗶𝘁 𝗙𝗼𝗿 𝗛𝗲𝗹𝗽 🌟 •••
❒ 🎥 **YouTube**: (https://youtube.com/@MarianaGutierrez-b5p)
❒ 📬 **Owner**: (https://t.me/Marianavivi0)
❒ 🔗 **WhatsApp Channel**: (https://whatsapp.com/channel/0029Varf29L8PgsDJuAJtn0G)
❒ 🖥️ **GitHub**: (https://github.com/Marianavivi/Sparky)
❒ 👩‍💻 **Developer**: Mariana
╚═══════════════╝
*✨💠CULTURE💠✨*
___________________________
- ⭐ **Do Not Forget To Fork and Give a Star⭐ To My Repo.**
- 📺 **Check Out the YouTube Channel Above for Tutorials.**`
                    });

                    // Clean up session after use
                    await delay(100);
                    removeFile(dirs);
                    process.exit(0);
                } else if (connection === 'close' && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode !== 401) {
                    console.log('Connection closed unexpectedly:', lastDisconnect.error);
                    await delay(10000);
                    initiateSession(); // Retry session initiation if needed
                }
            });
        } catch (err) {
            console.error('Error initializing session:', err);
            if (!res.headersSent) {
                res.status(503).send({ code: 'Service Unavailable' });
            }
        }
    }

    await initiateSession();
});

// Global uncaught exception handler
process.on('uncaughtException', (err) => {
    console.log('Caught exception: ' + err);
});

export default router;
