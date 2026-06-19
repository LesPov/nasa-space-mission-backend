
import { AppError } from '../../../../../infrastructure/errors/app.error';

export const handleExistingUserError = (error: string | null) => {
    if (error) {
        throw new AppError(error, 400, 'Error usuario o correo ya existe.');
    }
};