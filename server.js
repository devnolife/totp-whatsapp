const express = require('express');
const qrcode = require('qrcode-terminal');
const cors = require('cors')
const { Client, LocalAuth } = require('whatsapp-web.js');


const server = express();
server.use(cors())
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
const port = 8080;


const {
    phoneNumberFormatter,
    generateMessage,
} = require('./helpers');


const client = new Client({
    restartOnAuthFail: true,
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // <- this one doesn't works in Windows
            '--disable-gpu'
        ],
    },
    authStrategy: new LocalAuth()
});

client.initialize();

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Whatsapp Ready!');
});

client.on('authenticated', () => {
    console.log('authenticated', 'Whatsapp is authenticated!');
    console.log('message', 'Whatsapp is authenticated!');

});

client.on('auth_failure', function (session) {
    console.log('message', 'Auth failure, restarting...');
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
    client.destroy();
    client.initialize();
});


server.get('/', (req, res) => {
    res.json({
        message: "TOPT WhatsApp API by devnolife"
    }).status(200);
});

server.get('/check-number/:number', async (req, res) => {
    const number = phoneNumberFormatter(req.params.number);
    const isRegistered = await client.isRegisteredUser(number);
    try {
        if (!isRegistered) {
            return res.status(422).json({
                code: 422,
                message: 'Nomor belum terdaftar di WhatsApp',
                status: true,
                data: null
            });
        }

        return res.status(200).json({
            code: 200,
            message: 'Nomor sudah terdaftar di WhatsApp',
            status: true,
            data: null
        });
    } catch (err) {
        return res.status(500).json({
            code: 500,
            message: err.message || 'Internal server error',
            status: false,
            data: null
        });
    }
});

server.post('/api/send-totp/:number', async (req, res) => {
    const number = phoneNumberFormatter(req.params.number);
    const isRegistered = await client.isRegisteredUser(number);
    const message = generateMessage(req.params.number)
    try {
        if (!isRegistered) {
            return res.status(422).json({
                code: 422,
                status: true,
                message: 'Nomor belum terdaftar di WhatsApp',
                data: null
            });
        }

        await client.sendMessage(number, message);
        return res.status(200).json({
            code: 200,
            status: true,
            message: 'Kode TOTP berhasil dikirim',
            data: null
        });
    } catch (err) {
        return res.status(500).json({
            code: 500,
            status: false,
            message: err.message || 'Internal server error',
            data: null
        });
    }
})

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


