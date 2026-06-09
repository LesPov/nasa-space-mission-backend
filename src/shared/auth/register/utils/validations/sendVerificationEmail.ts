import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Cargar las variables de entorno
dotenv.config();

/**
 * Envía un correo de verificación con un código personalizado.
 *
 * @param {string} email - Dirección de correo electrónico del destinatario.
 * @param {string} username - Nombre de usuario asociado al correo.
 * @param {string} verificationCode - Código de verificación generado.
 * @returns {Promise<boolean>} - Devuelve true si el correo se envía con éxito, o false en caso de error.
 */
export const sendVerificationEmail = async (email: string, username: string, verificationCode: string): Promise<boolean> => {
    try {
        // Construye la ruta absoluta del archivo de plantilla de correo electrónico
        const templatePath = path.join(__dirname, '..', '..', '..', '..', 'templates' ,'emailtemplates', 'register', 'verificationEmail.html');
        console.log('Ruta de plantilla:', templatePath);
 
        // Lee la plantilla de correo electrónico desde el archivo
        const emailTemplate = fs.readFileSync(templatePath, 'utf-8');

        // Personaliza la plantilla
        const personalizedEmail = emailTemplate
            .replace('{{ username }}', username)
            .replace('{{ verificationCode }}', verificationCode);

        // Configura el transporte de Nodemailer
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        // Define las opciones del correo electrónico
        const mailOptions = {
            from: process.env.MAIL_USER,
            to: email,
            subject: 'Verificación de correo electrónico',
            html: personalizedEmail,
        };

        console.log('Código de verificación enviado:', verificationCode);

        // Envía el correo en segundo plano
        setImmediate(async () => {
            try {
                await transporter.sendMail(mailOptions);
                console.log('Correo de verificación enviado a:', email);
            } catch (error) {
                console.error('Error al enviar el correo de verificación:', error);
            }
        });

        return true;
    } catch (error) {
        console.error('Error al procesar el envío del correo:', error);
        return false;
    }
};
