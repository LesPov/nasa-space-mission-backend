
import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import path from 'path';
import puppeteer from 'puppeteer';

// Ruta donde se guardará la sesión
const sessionPath = path.resolve(__dirname, '../../../.wwebjs_sessions');

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "client-one",
        dataPath: sessionPath,
    }),
    puppeteer: { 
        executablePath: puppeteer.executablePath(), 
        // 🔥 FIX: Añadimos estos argumentos para evitar que Puppeteer 
        // colapse por falta de memoria compartida o fallos de contexto.
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ],
    }
});

client.on('qr', (qr: string) => {
    qrcode.generate(qr, { small: true });
    console.log('Escanea el siguiente código QR con tu aplicación de WhatsApp:', qr);
});

client.on('authenticated', () => {
    console.log('✅ Autenticación exitosa con WhatsApp.');
});

client.on('auth_failure', (message) => {
    console.error('❌ Error de autenticación con WhatsApp:', message);
});

client.on('ready', () => {
    console.log('✅ Conectado a WhatsApp y listo para enviar mensajes.');
});

client.on('disconnected', (reason) => {
    console.log('⚠️ Desconectado de WhatsApp. Razón:', reason);
});

// 🔥 AISLAMIENTO: Envolvemos la inicialización en una función para controlarla desde app.ts
// y añadimos un try-catch para que si Puppeteer falla, no mate al servidor de Node.js.
export const initializeChatbot = async () => {
    try {
        console.log('[Chatbot] Iniciando cliente de WhatsApp en segundo plano...');
        await client.initialize();
    } catch (error) {
        console.error('❌ Fallo crítico al iniciar el Chatbot de WhatsApp:', error);
        console.log('⚠️ El servidor de Express continuará funcionando sin el bot de WhatsApp.');
    }
};

export default client;