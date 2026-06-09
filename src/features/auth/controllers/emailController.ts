import { Request, Response } from 'express';
import { checkUserVerificationStatus, handleEmailNotVerificationErroruser } from '../../../shared/auth/emails/utils/check/checkUserVerificationStatus';
import { checkVerificationCodeExpiration, handleVerificationCodeExpirationError } from '../../../shared/auth/emails/utils/check/checkVerificationCodeExpiration';
import { checkVerificationCodeIsValid, handleVerificationCodeIsValidError } from '../../../shared/auth/emails/utils/check/checkVerificationCodeIsvValid';
import { handleUserNotFoundError } from '../../../shared/auth/emails/utils/errors/handleUserNotFoundError';
import { findUserByUsername } from '../../../shared/auth/emails/utils/findUser/findUserByUsername';
import { markEmailAsVerified, removeVerificationCode } from '../../../shared/auth/emails/utils/markItInDatabase/markItInDatabase';
import { handleServerError } from '../../../shared/auth/register/utils/invalidations/handleServerError';
import { successMessages } from '../../../shared/auth/succes/successMessages';
import { sendPhoneRegistrationEmail } from '../../../shared/auth/emails/utils/sendPhoneVerificationEmail';
  


export const verifyUser = async (req: Request, res: Response) => {

    try {
        const { username, verificationCode } = req.body;

        //Busca un usuario en la base de datos basado en su nombre de usuario.
        const user = await findUserByUsername(username);
        if (!user) {
            // Si el usuario no existe, maneja el error y termina el flujo.
            return handleUserNotFoundError(username, user, res);
        }

        // Verificar si el correo electrónico ya está verificado
        const isEmailVerified = checkUserVerificationStatus(user);
        // Maneja el error si el correo ya está verificado
        handleEmailNotVerificationErroruser(isEmailVerified, res);

        // Verifica si el código de verificación proporcionado es inválido.
        const isCodeValid = checkVerificationCodeIsValid(user, verificationCode);
        // Maneja el error si el código de verificación proporcionado es inválido
        handleVerificationCodeIsValidError(isCodeValid, res);

        const currentDate = new Date();
        // Verifica si el código de verificación ha expirado.
        const isCodeExpire = checkVerificationCodeExpiration(user, currentDate);
        console.log(`Código expirado: ${isCodeExpire}`);
        // Maneja el error si el código de verificación ha expirado.
        handleVerificationCodeExpirationError(isCodeExpire, res);

        //Marca el email del usuario como verificado en la base de datos.
        await markEmailAsVerified(user.id);

        // Elimina el código de verificación de la base de datos
        await removeVerificationCode(user.id);
        // Envía el correo con el link para el siguiente paso (verificación del teléfono).
        sendPhoneRegistrationEmail(user.email, user.username);
        //Mensege de exito 
        res.json({
            msg: successMessages.userVerified,
        });
    } catch (error: any) {
        // Manejar errores generales del servidor y responder con un mensaje de error
        handleServerError(error, res);
    }
};
