import qrcode from 'qrcode-terminal';
import path from 'path';

// Mantenemos la instancia de forma aislada
let clientInstance: any = null;

// Patrón Getter: Evita exportar directamente la instancia vacía
export const getWhatsappClient = () => {
    if (!clientInstance) {
        console.warn('⚠️ Intento de usar el Chatbot antes de que Chromium esté listo.');
        throw new Error("Chatbot no está inicializado aún. Intenta nuevamente en unos segundos.");
    }
    return clientInstance;
};

export const initializeChatbot = async () => {
    try {
        console.log('[Chatbot] Iniciando carga diferida de dependencias pesadas en segundo plano...');
        
        // Manejo de interoperabilidad CJS/ESM dinámica
        const rawWwebjs = await import('whatsapp-web.js');
        const wwebjs = (rawWwebjs as any).default || rawWwebjs;
        const { Client, LocalAuth } = wwebjs;

        if (!Client || !LocalAuth) {
            throw new Error("No se pudieron cargar Client o LocalAuth desde whatsapp-web.js");
        }

        const rawPuppeteer = await import('puppeteer');
        const puppeteer = (rawPuppeteer as any).default || rawPuppeteer;

        const sessionPath = path.resolve(process.cwd(), '.wwebjs_sessions');

        clientInstance = new Client({
            authStrategy: new LocalAuth({
                clientId: "client-one",
                dataPath: sessionPath,
            }),
            puppeteer: { 
                executablePath: puppeteer.executablePath(), 
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

        clientInstance.on('qr', (qr: string) => {
            qrcode.generate(qr, { small: true });
            console.log('Escanea el siguiente código QR con tu aplicación de WhatsApp:', qr);
        });

        clientInstance.on('authenticated', () => {
            console.log('✅ Autenticación exitosa con WhatsApp.');
        });

        clientInstance.on('auth_failure', (message: string) => {
            console.error('❌ Error de autenticación con WhatsApp:', message);
        });

        clientInstance.on('ready', () => {
            console.log('✅ Conectado a WhatsApp y listo para enviar mensajes.');
        });

        clientInstance.on('disconnected', (reason: string) => {
            console.log('⚠️ Desconectado de WhatsApp. Razón:', reason);
        });

        await clientInstance.initialize();

    } catch (error: any) {
        console.error('❌ Fallo crítico al iniciar el Chatbot de WhatsApp:', error);
        console.log('⚠️ El servidor de Express continuará funcionando sin el bot de WhatsApp.');
    }
};