
import { AppError } from '../../../../../../infrastructure/errors/app.error';
import { errorMessages } from '../../../../errors/auth.errors';
 
export const checkisUserVerified = (user: any): boolean => {
    const isVerified = user?.verification?.isVerified || false;
    if (!isVerified) {
        throw new AppError(errorMessages.unverifiedAccount(), 400, 'Error: El usuario no ha completado la verificación. Por favor, verifica tu cuenta antes de continuar.');
    }
    return isVerified;
};