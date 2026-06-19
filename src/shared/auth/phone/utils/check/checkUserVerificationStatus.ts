
import { AppError } from '../../../../../infrastructure/errors/app.error';
import { errorMessages } from '../../../errors/auth.errors';

export const checkUserVerificationStatusEmail = (user: any) => {
    const isEmailVerified = user?.verification?.isEmailVerified || false;
    if (!isEmailVerified) {
        throw new AppError(errorMessages.emailNotVerified(), 400, 'Error: El correo electrónico no ha sido verificado. Por favor, verifica tu correo antes de continuar.');
    }
    return isEmailVerified;
};