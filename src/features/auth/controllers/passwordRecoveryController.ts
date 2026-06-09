import { Request, Response } from 'express';
import { validateInputrRequestPassword } from '../../../shared/auth/login/recovery/utils/validations/resentValidation';
import { handleInputValidationErrors } from '../../../shared/auth/register/utils/invalidations/handleInputValidationErrors';
import { findUseRrequestPassword } from '../../../shared/auth/login/recovery/utils/findUser/findUserPasswordReset';
import { handleUserNotFoundErrorLogin } from '../../../shared/auth/login/verify/utils/findUser/findUserByUsernameLogin';
import { checkisUserVerified, handleUnverifiedUserError } from '../../../shared/auth/login/recovery/utils/check/checkUserVerificationStatus';
import { generateAndSetRandomPassword } from '../../../shared/auth/login/recovery/utils/generate/generateAndRandomPassword';
import { sendPasswordResetEmailPasswordReset } from '../../../shared/auth/login/recovery/utils/email/sendEmailCode';
import { handleSuccessMessagePasswordReset } from '../../../shared/auth/login/recovery/utils/success/handleSuccessMessage';
import { handleServerErrorRequestPassword1 } from '../../../shared/auth/login/recovery/utils/errors/handleServerError';
 

export const requestPasswordReset = async (req: Request, res: Response) => {
    try {
        // 1. Extraer y validar los datos de entrada
        const { usernameOrEmail } = req.body;
        const inputValidationErrors = validateInputrRequestPassword(usernameOrEmail);
        handleInputValidationErrors(inputValidationErrors, res);

        // 2. Búsqueda del usuario
        const user = await findUseRrequestPassword(usernameOrEmail);
        if (!user) {
            handleUserNotFoundErrorLogin(usernameOrEmail, user, res);
            return;
        }

        // 3. Verificación del estado del usuario isverified 
        const isVerified = checkisUserVerified(user);
        handleUnverifiedUserError(isVerified, res);

        // 4. Genera una nueva contraseña aleatoria y actualiza el registro de verificación
        const randomPassword = await generateAndSetRandomPassword(user.id);

        // 5. Envía un correo electrónico con la nueva contraseña aleatoria
        await sendPasswordResetEmailPasswordReset(user.email, user.username, randomPassword);

        // 6. Envia el mesge de exito
        handleSuccessMessagePasswordReset(res);

    } catch (error) {

        // 7. Manejo de errores de servidor
        handleServerErrorRequestPassword1(error, res);
    }
};
