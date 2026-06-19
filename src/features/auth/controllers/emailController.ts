
import { NextFunction, Request, Response } from 'express';
import { checkUserVerificationStatus } from '../../../shared/auth/emails/utils/check/checkUserVerificationStatus';
import { checkVerificationCodeExpiration } from '../../../shared/auth/emails/utils/check/checkVerificationCodeExpiration';
import { checkVerificationCodeIsValid } from '../../../shared/auth/emails/utils/check/checkVerificationCodeIsvValid';
import { findUserByUsername } from '../../../shared/auth/emails/utils/findUser/findUserByUsername';
import { markEmailAsVerified, removeVerificationCode } from '../../../shared/auth/emails/utils/markItInDatabase/markItInDatabase';
import { successMessages } from '../../../shared/auth/succes/successMessages';
import { sendPhoneRegistrationEmail } from '../../../shared/auth/emails/utils/sendPhoneVerificationEmail';
import { AppError } from '../../../infrastructure/errors/app.error';
import { errorMessages } from '../../../shared/auth/errors/auth.errors';

export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, verificationCode } = req.body;

        const user = await findUserByUsername(username);
        if (!user) {
            throw new AppError(errorMessages.userNotFound(username), 404, 'Error: El usuario no fue encontrado en la base de datos.');
        }

        checkUserVerificationStatus(user);
        checkVerificationCodeIsValid(user, verificationCode);
        
        const currentDate = new Date();
        checkVerificationCodeExpiration(user, currentDate);

        await markEmailAsVerified(user.id);
        await removeVerificationCode(user.id);
        sendPhoneRegistrationEmail(user.email, user.username);
        
        res.status(200).json({
            msg: successMessages.userVerified,
        });
    } catch (error: any) {
        next(error); // Delegamos el error al middleware global
    }
};