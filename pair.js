const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
const router = express.Router();
const pino = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  delay,
  makeCacheableSignalKeyStore,
  Browsers,
} = require('@whiskeysockets/baileys');

// Function to remove a file
function removeFile(FilePath) {
  if (fs.existsSync(FilePath)) {
    fs.rmSync(FilePath, { recursive: true, force: true });
  }
}

router.get('/', async (req, res) => {
  const id = makeid();
  let num = req.query.number;

  async function CULTURE_PAIR_CODE() {
    const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
    try {
      const Pair_Code_By_Mariana = makeWASocket({
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' })),
        },
        printQRInTerminal: false,
        logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
        browser: Browsers.macOS('Desktop'),
      });

      // Request pairing code if not registered
      if (!Pair_Code_By_Mariana.authState.creds.registered) {
        await delay(1500);
        num = num.replace(/[^0-9]/g, '');
        const code = await Pair_Code_By_Mariana.requestPairingCode(num);
        if (!res.headersSent) {
          await res.send({ code });
        }
      }

      Pair_Code_By_Mariana.ev.on('creds.update', saveCreds);
      Pair_Code_By_Mariana.ev.on('connection.update', async (s) => {
        const { connection, lastDisconnect } = s;

        if (connection == 'open') {
          await delay(5000);
          const data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
          await delay(800);
          const b64data = Buffer.from(data).toString('base64');
          const session = await Pair_Code_By_Mariana.sendMessage(Pair_Code_By_Mariana.user.id, { text: 'CULTURE~;;;' + b64data });

          const CULTURE_TEXT = `
*_Pair Code By Mariana_*
*_Made With 🤍_*

_Don't Forget To Give Star To My Repo_`;
          await Pair_Code_By_Mariana.sendMessage(Pair_Code_By_Mariana.user.id, { text: CULTURE_TEXT }, { quoted: session });

          await delay(100);
          await Pair_Code_By_Mariana.ws.close();
          return await removeFile('./temp/' + id);
        } else if (connection === 'close' && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
          await delay(10000);
          CULTURE_PAIR_CODE();
        }
      });
    } catch (err) {
      console.log('service restarted');
      await removeFile('./temp/' + id);
      if (!res.headersSent) {
        await res.send({ code: 'Service Unavailable' });
      }
    }
  }

  return await CULTURE_PAIR_CODE();
});

module.exports = router;
