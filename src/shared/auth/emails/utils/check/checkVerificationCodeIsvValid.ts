
import { AppError } from '../../../../../infrastructure/errors/app.error';
import { errorMessages } from '../../../errors/auth.errors';

export const checkVerificationCodeIsValid = (user: any, verificationCode: string): boolean => {
    const isCodeValid = user.verification.verificationCode === verificationCode.trim();
    if (!isCodeValid) {
        throw new AppError(errorMessages.invalidVerificationCode(), 400, 'Error: El código de verificación proporcionado es inválido o no coincide con el de la base de datos.');
    }
    return isCodeValid;
};