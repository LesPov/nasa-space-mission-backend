
import { AppError } from '../../../../../infrastructure/errors/app.error';
import { errorMessages } from '../../../errors/auth.errors';
 
export const checkUserVerificationStatus = (user: any) => {
    const isEmailVerified = user?.verification?.isEmailVerified || false;
    if (isEmailVerified) {
        throw new AppError(errorMessages.userAlreadyVerifiedemail(), 400, 'Error: El correo electrónico ya ha sido verificado.');
    }
    return isEmailVerified;
};