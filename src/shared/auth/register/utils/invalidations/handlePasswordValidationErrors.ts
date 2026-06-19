
import { AppError } from '../../../../../infrastructure/errors/app.error';

export const handlePasswordValidationErrors = (errors: string[]) => {
    if (errors.length > 0) {
        throw new AppError(errors.join(', '), 400, 'Error en la validación de la contraseña');
    }
};