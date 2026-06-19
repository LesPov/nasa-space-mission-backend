
import { AppError } from '../../../../../infrastructure/errors/app.error';
import { errorMessages } from '../../../errors/auth.errors';

export const checkVerificationCodeExpiration = (user: any, currentDate: Date): boolean => {
    const expirationDate = user?.verification?.verificationCodeExpiration;
    const isCodeExpire = expirationDate ? new Date(expirationDate) < currentDate : false;
    
    if (isCodeExpire) {
        throw new AppError(errorMessages.verificationCodeExpired, 400, 'Error: El código de verificación ha expirado.');
    }
    return isCodeExpire;
};