import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import path from 'path';
import puppeteer from 'puppeteer'; // <-- 1. Importa puppeteer

// Ruta donde se guardará la sesión
const sessionPath = path.resolve(__dirname, '../../../.wwebjs_sessions');

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "client-one",
        dataPath: sessionPath,
    }),
    puppeteer: { // <-- 2. Añade esta sección
        executablePath: puppeteer.executablePath(), // <-- Le dice dónde está el Chrome/Chromium descargado
        // Opcional: A veces son necesarios, descomenta si sigue fallando
        // args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

client.on('qr', (qr: string) => {
    qrcode.generate(qr, { small: true });
    console.log('Escanea el siguiente código QR con tu aplicación de WhatsApp:', qr);
});

client.on('authenticated', () => {
    console.log('Autenticación exitosa.');
});

client.on('auth_failure', (message) => {
    console.error('Error de autenticación con WhatsApp:', message);
});

client.on('ready', () => {
    console.log('Conectado a WhatsApp y listo para enviar mensajes.');
});

client.on('disconnected', (reason) => {
    console.log('Desconectado de WhatsApp. Razón:', reason);
});

client.initialize();

export default client;