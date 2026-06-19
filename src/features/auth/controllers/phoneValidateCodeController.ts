
import { NextFunction, Request, Response } from 'express';
import { validateInputVerifyCode } from '../../../shared/auth/phone/verify/utils/validations/validateInput';
import { handleInputValidationErrors } from '../../../shared/auth/register/utils/invalidations/handleInputValidationErrors';
import { findUserByUsername } from '../../../shared/auth/emails/utils/findUser/findUserByUsername';
import { checkUserVerificationStatusEmail } from '../../../shared/auth/phone/utils/check/checkUserVerificationStatus';
import { checkUserVerificationStatusPhone } from '../../../shared/auth/phone/verify/utils/check/checkUserVerificationStatusPhone';
import { checkUserPhoneNumberAssociationCode } from '../../../shared/auth/phone/verify/utils/check/checkUserPhoneNumberAssociation';
import { checkVerificationCodeIsValid } from '../../../shared/auth/emails/utils/check/checkVerificationCodeIsvValid';
import { checkVerificationCodeExpiration } from '../../../shared/auth/emails/utils/check/checkVerificationCodeExpiration';
import { markisPhoneVerified, markisVerified } from '../../../shared/auth/phone/verify/utils/markItInDatabase/marckisPhoneVerified';
import { removeVerificationCode } from '../../../shared/auth/emails/utils/markItInDatabase/markItInDatabase';
import { successMessages } from '../../../shared/auth/succes/successMessages';
import { sendWhatsAppMessage } from '../../../shared/auth/phone/utils/send/sendWhatsAppMessage';
import { AppError } from '../../../infrastructure/errors/app.error';
import { errorMessages } from '../../../shared/auth/errors/auth.errors';

export const verifyPhoneNumber = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, phoneNumber, verificationCode } = req.body;
        const inputValidationErrors = validateInputVerifyCode(username, phoneNumber, verificationCode);
        handleInputValidationErrors(inputValidationErrors);

        const user = await findUserByUsername(username);
        if (!user) {
            throw new AppError(errorMessages.userNotFound(username), 404, 'Error: El usuario no fue encontrado.');
        }
        
        checkUserVerificationStatusEmail(user);
        checkUserVerificationStatusPhone(user);
        checkUserPhoneNumberAssociationCode(user, phoneNumber);
        checkVerificationCodeIsValid(user, verificationCode);
        
        const currentDate = new Date();
        checkVerificationCodeExpiration(user, currentDate);

        await markisPhoneVerified(user.id);
        await markisVerified(user.id);
        await removeVerificationCode(user.id);

        res.status(200).json({
            msg: successMessages.phoneVerified,
        });

        const message = `Hola ${username}, tu número de teléfono ha sido verificado exitosamente. Ya puedes iniciar sesión en tu cuenta.`;
        await sendWhatsAppMessage(phoneNumber, message);

    } catch (error) {
        next(error);
    }
}