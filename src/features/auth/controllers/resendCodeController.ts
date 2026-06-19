
import { NextFunction, Request, Response } from 'express';
import { findUserByUsername } from '../../../shared/auth/emails/utils/findUser/findUserByUsername';
import { sendVerificationEmail } from '../../../shared/auth/register/utils/validations/sendVerificationEmail';
import { createOrUpdateVerificationEntry } from '../../../shared/auth/emails/utils/createOrUpdateVerificationEntry';
import { AppError } from '../../../infrastructure/errors/app.error';
import { errorMessages } from '../../../shared/auth/errors/auth.errors';
  
export const resendVerificationCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username } = req.body;

        const user = await findUserByUsername(username);
        if (!user) {
            throw new AppError(errorMessages.userNotFound(username), 404, 'Error: El usuario no fue encontrado.');
        }

        const newVerificationCode = await createOrUpdateVerificationEntry(user.id);
        await sendVerificationEmail(user.email, username, newVerificationCode);

        res.status(200).json({
            msg: 'Código de verificación reenviado exitosamente.',
        });

    } catch (error: any) {
        next(error);
    }
};