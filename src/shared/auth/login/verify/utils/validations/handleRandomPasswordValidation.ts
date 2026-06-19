
import { AppError } from '../../../../../../infrastructure/errors/app.error';
import { checkVerificationCodeExpiration } from '../../../../emails/utils/check/checkVerificationCodeExpiration';
import { validateRandomPassword } from './validatePasswordLogin';
 
export const handleRandomPasswordValidation = async (user: any, password: string) => {
    const isRandomPasswordValid = await validateRandomPassword(user, password);

    if (!isRandomPasswordValid) {
        throw new AppError('La contraseña aleatoria es incorrecta.', 401, 'Error: La contraseña aleatoria que ingresaste no coincide con la registrada.');
    }

    const currentDate = new Date();
    checkVerificationCodeExpiration(user, currentDate);

    return true;
};