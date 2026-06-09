import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { validateInputresetPassword } from '../../../shared/auth/login/reset/utils/validations/validateInputResetPassword';
import { handleInputValidationErrors } from '../../../shared/auth/register/utils/invalidations/handleInputValidationErrors';
import { findUseRrequestPassword } from '../../../shared/auth/login/recovery/utils/findUser/findUserPasswordReset';
import { handleUserNotFoundErrorLogin } from '../../../shared/auth/login/verify/utils/findUser/findUserByUsernameLogin';
import { checkisUserVerified, handleUnverifiedUserError } from '../../../shared/auth/login/recovery/utils/check/checkUserVerificationStatus';
import { checkVerificationRandomPassword, handleVerificationRandomPasswordError } from '../../../shared/auth/login/reset/utils/check/checkVerificationRandomPass';
import { checkVerificationCodeExpiration } from '../../../shared/auth/emails/utils/check/checkVerificationCodeExpiration';
import { handleVerificationCodeExpirationErrorReset } from '../../../shared/auth/login/reset/utils/errors/handleVerificationCodeExpirationError';
import { handleNewPasswordValidationErrors, validateNewPassword } from '../../../shared/auth/login/reset/utils/validations/validateNewPassword';
import { updatePasswordInDatabase } from '../../../shared/auth/login/reset/utils/newPassword/newPassword';
import { removerandomPassword } from '../../../shared/auth/login/reset/utils/remove/removeRandomPassword';
import { handleSuccessMessageResetNewPassword } from '../../../shared/auth/login/reset/utils/succes/handleSuccessMessage';
import { handleServerErrorResetPassword } from '../../../shared/auth/login/reset/utils/errors/handleServerError';

 
export const resetPassword = async (req: Request, res: Response) => {
    try {
        // 1. Extraer y validar los datos de entrada
        const { usernameOrEmail, randomPassword, newPassword } = req.body;

        const inputValidationErrors = validateInputresetPassword(usernameOrEmail, randomPassword, newPassword);
        handleInputValidationErrors(inputValidationErrors, res);

        // 2. Búsqueda del usuario
        const user = await findUseRrequestPassword(usernameOrEmail);
        if (!user) {
            handleUserNotFoundErrorLogin(usernameOrEmail, user, res);
            return;
        }

        // 3. Verificación del estado del usuario (si está verificado)
        const isVerified = checkisUserVerified(user);
        handleUnverifiedUserError(isVerified, res);

        // 4. Verifica si el randomPassword de verificación proporcionado es válido
        const isCodeValid = checkVerificationRandomPassword(user, randomPassword);
        handleVerificationRandomPasswordError(isCodeValid, res);

        // Verifica si el randomPassword de verificación ha expirado
        const currentDate = new Date();
        const isCodeExpire = checkVerificationCodeExpiration(user, currentDate);
        handleVerificationCodeExpirationErrorReset(isCodeExpire, res);

        // 5. Validar los requisitos de la nueva contraseña
        const newPasswordValidationErrors = validateNewPassword(newPassword);
        handleNewPasswordValidationErrors(newPasswordValidationErrors, res);

        // 6. Si todo es válido, proceder a encriptar la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 7. Guardar la nueva contraseña en la base de datos
        await updatePasswordInDatabase(user.id, hashedPassword);

        // 8. Eliminar el randomPassword de verificación
        await removerandomPassword(user.id);

        // 9. Enviar mensaje de éxito
        return handleSuccessMessageResetNewPassword(res);

    } catch (error) {
        // Manejo de errores del servidor
        handleServerErrorResetPassword(error, res);
    }
};