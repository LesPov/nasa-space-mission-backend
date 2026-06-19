
import { getWhatsappClient } from '../../../../../infrastructure/chatbot/chatbot.client';

export const sendWhatsAppMessage = async (phoneNumber: string, message: string): Promise<void> => {
    try {
        const formattedNumber = `${phoneNumber.replace(/[-+()\s]/g, '')}@c.us`; 
        
        // Obtenemos la instancia en tiempo de ejecución de manera segura
        const whatsappClient = getWhatsappClient();

        await whatsappClient.sendMessage(formattedNumber, message);
        console.log('Mensaje enviado con éxito a:', phoneNumber);

    } catch (error: any) {
        console.error('Error al enviar mensaje por WhatsApp:', error.message || error);
        throw new Error('Failed to send WhatsApp message');
    }
};