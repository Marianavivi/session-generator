const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const QRCode = require('qrcode');
const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const pino = require('pino');
const {
  default: Maher_Zubair,
  useMultiFileAuthState,
  Browsers,
  delay,
} = require('maher-zubair-baileys');

// Function to remove a file
function removeFile(FilePath) {
  if (fs.existsSync(FilePath)) {
    fs.rmSync(FilePath, {
      recursive: true,
      force: true,
    });
  }
};

router.get('/', async (req, res) => {
  const id = makeid();

  async function CULTURE_QR_CODE() {
    const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);

    try {
      const Qr_Code_By_MARIANA = Mariana({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: Browsers.macOS('Desktop'),
      });

      Qr_Code_By_Mariana.ev.on('creds.update', saveCreds);
      Qr_Code_By_Mariana.ev.on('connection.update', async (s) => {
        const { connection, lastDisconnect, qr } = s;

        // Send QR code
        if (qr) await res.end(await QRCode.toBuffer(qr));

        // Handle successful connection
        if (connection === 'open') {
          await delay(5000);
          const data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
          await delay(800);
          const b64data = Buffer.from(data).toString('base64');
          const session = await .sendMessage(Qr_Code_By_Mariana.user.id, { text: 'Culture~;;;' + b64data });

          const CULTURE_TEXT = `
          *_QR Code By Mariana_*
          *_Made With 🤍_*

          _Don't Forget To Give Star To My Repo_`;
          await Qr_Code_By_Mariana.sendMessage(.user.id, { text: CULTURE_TEXT }, { quoted: session });

          await delay(100);
          await Qr_Code_By_Mariana.ws.close();
          return await removeFile('temp/' + id);
        } else if (connection === 'close' && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode !== 401) {
          await delay(10000);
          CULTURE_QR_CODE();
        }
      });
    } catch (err) {
      if (!res.headersSent) {
        await res.json({ code: 'Service Unavailable' });
      }
      console.error(err);
      await removeFile('temp/' + id);
    }
  }

  return await SIGMA_MD_QR_CODE();
});

module.exports = router;
