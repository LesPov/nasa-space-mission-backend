
import { AppError } from '../../../../../../infrastructure/errors/app.error';
import { errorMessages } from '../../../../errors/auth.errors';

export const checkUserPhoneNumberAssociationCode = (user: any, phoneNumber: string) => {
    const isAssociated = user.phoneNumber === phoneNumber;
    if (!isAssociated) {
        throw new AppError(errorMessages.incorrectPhoneNumber(), 400, 'Número de teléfono no coincide con el registrado.');
    }
    return isAssociated;
};