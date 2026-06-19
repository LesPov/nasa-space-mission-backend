
import { AppError } from '../../../../../infrastructure/errors/app.error';
import { errorMessages } from '../../../errors/auth.errors';
import { AuthModel } from '../../../../../features/auth/models/authModel';
 
export const checkUserPhoneSendCode = async (phoneNumber: string): Promise<boolean> => {
    const userWithPhoneNumber = await AuthModel.findOne({
        where: { phoneNumber: phoneNumber }
    });
    const isRegistered = userWithPhoneNumber !== null;

    if (isRegistered) {
        throw new AppError(errorMessages.phoneNumberExists, 400, 'Error: El número de teléfono ya ha sido registrado en la base de datos. Ingresa otro.');
    }

    return isRegistered;
};