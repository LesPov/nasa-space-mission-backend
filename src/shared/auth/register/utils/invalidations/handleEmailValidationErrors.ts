
import { AppError } from '../../../../../infrastructure/errors/app.error';

export const handleEmailValidationErrors = (errors: string[]) => {
    if (errors.length > 0) {
        throw new AppError(errors.join(', '), 400, 'Error en la validación del correo electrónico');
    }
};