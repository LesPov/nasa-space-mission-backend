import { Request, Response } from 'express';
import { validateInput } from '../../../shared/auth/phone/utils/validations/validateInput';
import { handleInputValidationErrors } from '../../../shared/auth/register/utils/invalidations/handleInputValidationErrors';
import { findUserByUsername } from '../../../shared/auth/phone/utils/findUser/findUserByUsername';
import { handleUserNotFoundError } from '../../../shared/auth/phone/utils/errors/handleInputValidationErrors';
import { checkUserVerificationStatusEmail, handleEmailNotVerificationErroruser } from '../../../shared/auth/phone/utils/check/checkUserVerificationStatus';
 import { checkUserPhoneSendCode, handlePhoneVerificationError } from '../../../shared/auth/phone/utils/check/checkUserPhoneSendCode';
import { checkUserPhoneNumberAssociation, handlePhoneNumberAssociationError } from '../../../shared/auth/phone/utils/check/checkUserPhoneNumberAssociation';
import { updatePhoneNumber } from '../../../shared/auth/phone/utils/updatePhone/updatePhoneNumber';
import { createVerificationEntryPhone } from '../../../shared/auth/phone/utils/check/createVerificationEntryPhone';
import { sendWhatsAppMessage } from '../../../shared/auth/phone/utils/send/sendWhatsAppMessage';
import { handleServerError } from '../../../shared/auth/phone/utils/errors/handleServerError';
 
  
export const sendVerificationCodePhone = async (req: Request, res: Response) => {
    try {
        // 1. Validación de entrada
        const { username, phoneNumber } = req.body;
        const inputValidationErrors = validateInput(username, phoneNumber);
        handleInputValidationErrors(inputValidationErrors, res);

        // 2. Búsqueda del usuario si existe
        const user = await findUserByUsername(username);
        handleUserNotFoundError(username, user, res);

        // 3. Verificación del estado del usuario Email
        const isEmailVerified = checkUserVerificationStatusEmail(user);
        handleEmailNotVerificationErroruser(isEmailVerified, res);

        // 4. Verificación del número de teléfono si ya está registrado
        const isPhoneNumberVerified = await checkUserPhoneSendCode(phoneNumber);
        handlePhoneVerificationError(isPhoneNumberVerified, res);

        // 5. Verificación de asociación de número de teléfono
        const isPhoneNumberAssociated = checkUserPhoneNumberAssociation(user);
        handlePhoneNumberAssociationError(isPhoneNumberAssociated, res);

       
        if (!user) return; 

        await updatePhoneNumber(user.id, phoneNumber);
        const sendcodesms = await createVerificationEntryPhone(user.id, phoneNumber);

        // --- ¡CAMBIO CLAVE AQUÍ! ---
        // Construimos un enlace HTTPS a una página "puente" en tu frontend.
        // Pasamos los parámetros originales como query params a ESTA URL.
        const bridgeLink = `${process.env.FRONTEND_URL}/auth/verifynumber?username=${encodeURIComponent(username)}&phoneNumber=${encodeURIComponent(phoneNumber)}`;

        const message = `Tu código de verificación es: ${sendcodesms}\n\n` +
            `Para continuar el proceso, haz clic en el siguiente enlace:\n\n` +
            // WhatsApp convertirá este enlace HTTPS en un link clickable.
            `<${bridgeLink}>`;

        console.log('El mensaje con enlace puente enviado fue:', message);

        await sendWhatsAppMessage(phoneNumber, message);

        res.status(200).json({ message: 'Código de verificación y enlace enviados exitosamente por WhatsApp.' });
    } catch (error) {
        // Manejar errores generales del servidor y responder con un mensaje de error
        handleServerError(error, res);
    }
};
