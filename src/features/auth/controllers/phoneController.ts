
import { NextFunction, Request, Response } from 'express';
import { validateInput } from '../../../shared/auth/phone/utils/validations/validateInput';
import { handleInputValidationErrors } from '../../../shared/auth/register/utils/invalidations/handleInputValidationErrors';
import { findUserByUsername } from '../../../shared/auth/phone/utils/findUser/findUserByUsername';
import { checkUserVerificationStatusEmail } from '../../../shared/auth/phone/utils/check/checkUserVerificationStatus';
import { checkUserPhoneSendCode } from '../../../shared/auth/phone/utils/check/checkUserPhoneSendCode';
import { checkUserPhoneNumberAssociation } from '../../../shared/auth/phone/utils/check/checkUserPhoneNumberAssociation';
import { updatePhoneNumber } from '../../../shared/auth/phone/utils/updatePhone/updatePhoneNumber';
import { createVerificationEntryPhone } from '../../../shared/auth/phone/utils/check/createVerificationEntryPhone';
import { sendWhatsAppMessage } from '../../../shared/auth/phone/utils/send/sendWhatsAppMessage';
import { AppError } from '../../../infrastructure/errors/app.error';
import { errorMessages } from '../../../shared/auth/errors/auth.errors';
  
export const sendVerificationCodePhone = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, phoneNumber } = req.body;
        const inputValidationErrors = validateInput(username, phoneNumber);
        handleInputValidationErrors(inputValidationErrors);

        const user = await findUserByUsername(username);
        if (!user) {
            throw new AppError(errorMessages.userNotFound(username), 404, 'Error: El usuario no fue encontrado.');
        }

        checkUserVerificationStatusEmail(user);
        await checkUserPhoneSendCode(phoneNumber);
        checkUserPhoneNumberAssociation(user);

        await updatePhoneNumber(user.id, phoneNumber);
        const sendcodesms = await createVerificationEntryPhone(user.id, phoneNumber);

        const bridgeLink = `${process.env.FRONTEND_URL}/auth/verifynumber?username=${encodeURIComponent(username)}&phoneNumber=${encodeURIComponent(phoneNumber)}`;

        const message = `Tu código de verificación es: ${sendcodesms}\n\n` +
            `Para continuar el proceso, haz clic en el siguiente enlace:\n\n` +
            `<${bridgeLink}>`;

        console.log('El mensaje con enlace puente enviado fue:', message);

        await sendWhatsAppMessage(phoneNumber, message);

        res.status(200).json({ message: 'Código de verificación y enlace enviados exitosamente por WhatsApp.' });
    } catch (error) {
        next(error);
    }
};