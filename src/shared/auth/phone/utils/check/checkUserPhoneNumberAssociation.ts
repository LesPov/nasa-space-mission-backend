
import { AppError } from '../../../../../infrastructure/errors/app.error';

export const checkUserPhoneNumberAssociation = (user: any) => {
    const isPhoneNumberAssociated = !!user?.phoneNumber;  
    if (isPhoneNumberAssociated) {
        throw new AppError('Error: Ya tienes un número de teléfono asociado a tu cuenta. No puedes agregar otro.', 400, 'Número de teléfono ya asociado');
    }
    return isPhoneNumberAssociated;
};