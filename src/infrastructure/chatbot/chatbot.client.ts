
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
        
        // 🔥 LAZY LOADING: Importamos whatsapp-web y puppeteer dinámicamente. 
        // Solo se ejecutan tras levantar Express.
        const { Client, LocalAuth } = await import('whatsapp-web.js');
        const puppeteer = await import('puppeteer');

        const sessionPath = path.resolve(__dirname, '../../../.wwebjs_sessions');

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

        // Este proceso ahora se ejecuta de forma asíncrona sin trabar el Event Loop raíz
        await clientInstance.initialize();

    } catch (error) {
        console.error('❌ Fallo crítico al iniciar el Chatbot de WhatsApp:', error);
        console.log('⚠️ El servidor de Express continuará funcionando sin el bot de WhatsApp.');
    }
};