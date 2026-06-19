
import { AppError } from '../../../../../../infrastructure/errors/app.error';
import { errorMessages } from '../../../../errors/auth.errors';

export const checkUserVerificationStatusPhone = (user: any): boolean => {
    const isPhoneVerified = user?.verification?.isPhoneVerified || false;
    if (isPhoneVerified) {
        throw new AppError(errorMessages.phoneAlreadyVerified(), 400, 'Error: El número de teléfono ya ha sido verificado. No es necesario verificarlo de nuevo.');
    }
    return isPhoneVerified;
};