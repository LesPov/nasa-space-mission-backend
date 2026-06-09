// utils/validations/handleRandomPassword.ts
import { Response } from 'express';
import { checkVerificationCodeExpiration } from '../../../../emails/utils/check/checkVerificationCodeExpiration';
import { validateRandomPassword } from './validatePasswordLogin';
import { handleVerificationCodeExpirationErrorReset } from '../../../reset/utils/errors/handleVerificationCodeExpirationError';
 
export const handleRandomPasswordValidation = async (user: any, password: string, res: Response) => {
    // Verifica si la contraseña aleatoria coincide con la del usuario
    const isRandomPasswordValid = await validateRandomPassword(user, password);

    if (!isRandomPasswordValid) {
        res.status(401).json({
            msg: 'La contraseña aleatoria es incorrecta.',
            errors: 'Error: La contraseña aleatoria que ingresaste no coincide con la registrada.',
        });
        return false; // Contraseña inválida
    }

    // Si la contraseña es válida, verifica si ha expirado
    const currentDate = new Date();
    const isCodeExpire = checkVerificationCodeExpiration(user, currentDate);
    if (isCodeExpire) {
        handleVerificationCodeExpirationErrorReset(isCodeExpire, res);
        return false; // Código expirado
    }

    return true; // Contraseña válida y no expirada
};
