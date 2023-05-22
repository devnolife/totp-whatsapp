const crypto = require('crypto');

const generateTOTP = (secret) => {
    const time = Math.floor(Date.now() / 1000 / 120);
    const buffer = Buffer.alloc(8);
    buffer.writeBigInt64BE(BigInt(time));
    const hmac = crypto.createHmac('sha1', secret).update(buffer).digest();
    const offset = hmac[hmac.length - 1] & 0xf;
    let code = ((hmac[offset] & 0x7f) << 24)
        | ((hmac[offset + 1] & 0xff) << 16)
        | ((hmac[offset + 2] & 0xff) << 8)
        | (hmac[offset + 3] & 0xff);

    code = code.toString();
    code = code.substr(code.length - 4, 4);
    return code;
}

const generateUniqueCode = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const codeLength = length;
    let uniqueCode = '';

    for (let i = 0; i < codeLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        uniqueCode += characters[randomIndex];
    }

    return uniqueCode;
}


const generateMessage = (number) => {
    let token = generateTOTP(number);
    let uniqueCode = generateUniqueCode(10);
    let uniqueCode2 = generateUniqueCode(20);
    const currentDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Makassar' });
    const message = `Berich Elite - Kode ${token}\nJangan Berikan Kode Ini Kepada Siapapun.*\n📱${uniqueCode2}\n
    \n✉️ Balas *Ya* apabila pesan sudah anda diterima ✉️\n [${currentDate}] 📱${uniqueCode}`;
    return message;
}

const phoneNumberFormatter = function (number) {
    let formatted = number.replace(/\D/g, '');
    if (formatted.startsWith('0')) {
        formatted = '62' + formatted.substr(1);
    }
    if (!formatted.endsWith('@c.us')) {
        formatted += '@c.us';
    }

    return formatted;
}

module.exports = {
    phoneNumberFormatter,
    generateMessage,
    generateUniqueCode,
    generateTOTP
}
