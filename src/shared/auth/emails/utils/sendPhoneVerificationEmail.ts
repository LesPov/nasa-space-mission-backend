import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Envía un correo con el link para continuar el registro del número de teléfono.
 *
 * @param {string} email - Dirección de correo del usuario.
 * @param {string} username - Nombre de usuario.
 * @returns {Promise<boolean>} - Retorna true si se envía correctamente, false en caso de error.
 */
export const sendPhoneRegistrationEmail = async (email: string, username: string): Promise<boolean> => {
  try {
    // Ruta de la plantilla del correo para el registro del número de teléfono.
    const templatePath = path.join(__dirname, '..', '..', '..', '..', 'shared', 'templates' ,'emailtemplates', 'email', 'phoneRegistrationEmail.html');
    console.log('Ruta de plantilla para registro de teléfono:', templatePath);

    // Lee la plantilla HTML del correo.
    const emailTemplate = fs.readFileSync(templatePath, 'utf-8');

    // Construye el link para continuar con el registro del número de teléfono.
    const phoneRegistrationLink = `${process.env.FRONTEND_URL}/auth/number?username=${encodeURIComponent(username)}`;

    // Personaliza la plantilla reemplazando los placeholders.
    const personalizedEmail = emailTemplate
      .replace('{{ username }}', username)
      .replace('{{ phoneRegistrationLink }}', phoneRegistrationLink);

    // Configura el transporte de Nodemailer.
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER, 
        pass: process.env.MAIL_PASS,
      },
    });

    // Define las opciones del correo.
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Siguiente paso: Registro de número de teléfono',
      html: personalizedEmail,
    };

    // Envía el correo de forma asíncrona.
    setImmediate(async () => {
      try {
        await transporter.sendMail(mailOptions);
        console.log('Correo de registro de teléfono enviado a:', email);
      } catch (error) {
        console.error('Error al enviar el correo de registro de teléfono:', error);
      }
    });

    return true;
  } catch (error) {
    console.error('Error al procesar el envío del correo de registro de teléfono:', error);
    return false;
  }
};
