
import { AppError } from '../../../../../infrastructure/errors/app.error';

export const handleInputValidationErrors = (errors: string[]): void => {
    if (errors.length > 0) {
        throw new AppError(errors.join(', '), 400, 'Error en la validación de la entrada de datos');
    }
};