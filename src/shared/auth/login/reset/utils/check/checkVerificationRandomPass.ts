
import { AppError } from '../../../../../../infrastructure/errors/app.error';
import { errorMessages } from '../../../../errors/auth.errors';
 
export const checkVerificationRandomPassword = (user: any, randomPassword: string): boolean => {
    const isCodeValid = user.verification.randomPassword === randomPassword.trim();
    if (!isCodeValid) {
        throw new AppError(errorMessages.invalidRandomPassword(), 400, 'Error: El randomPassword de verificación proporcionado es inválido o no coincide con el de la base de datos.');
    }
    return isCodeValid;
};