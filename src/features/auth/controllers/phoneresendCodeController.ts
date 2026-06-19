
import { NextFunction, Request, Response } from 'express';
import { validateInputVerifyCodeResend } from '../../../shared/auth/phone/resend/utils/validations/validateInputVerifyCodeResend';
import { handleInputValidationErrors } from '../../../shared/auth/register/utils/invalidations/handleInputValidationErrors';
import { findUserByUsername } from '../../../shared/auth/phone/utils/findUser/findUserByUsername';
import { createOrUpdateVerificationEntry } from '../../../shared/auth/emails/utils/createOrUpdateVerificationEntry';
import { sendWhatsAppMessage } from '../../../shared/auth/phone/utils/send/sendWhatsAppMessage';
import { successMessages } from '../../../shared/auth/succes/successMessages';
import { AppError } from '../../../infrastructure/errors/app.error';
import { errorMessages } from '../../../shared/auth/errors/auth.errors';

export const resendVerificationCodePhone = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, phoneNumber } = req.body;
        const inputValidationErrors = validateInputVerifyCodeResend(username, phoneNumber);
        handleInputValidationErrors(inputValidationErrors);

        const user = await findUserByUsername(username)
        if (!user) {
            throw new AppError(errorMessages.userNotFound(username), 404, 'Error: El usuario no fue encontrado.');
        }

        const newVerificationCode = await createOrUpdateVerificationEntry(user.id);

        const message = `Hola ${username}, tu nuevo código de verificación es ${newVerificationCode}. Por favor, úsalo para verificar tu número de teléfono antes de que se expire.`;
        console.log('El mensaje enviado fue:', message);
        
        await sendWhatsAppMessage(phoneNumber, message);

        res.status(200).json({
            msg: successMessages.verificationCodeSent,
        });

    } catch (error) {
        next(error);
    }
};