
import { NextFunction, Request, Response } from 'express';
import { validateInputrRequestPassword } from '../../../shared/auth/login/recovery/utils/validations/resentValidation';
import { handleInputValidationErrors } from '../../../shared/auth/register/utils/invalidations/handleInputValidationErrors';
import { findUseRrequestPassword } from '../../../shared/auth/login/recovery/utils/findUser/findUserPasswordReset';
import { checkisUserVerified } from '../../../shared/auth/login/recovery/utils/check/checkUserVerificationStatus';
import { generateAndSetRandomPassword } from '../../../shared/auth/login/recovery/utils/generate/generateAndRandomPassword';
import { sendPasswordResetEmailPasswordReset } from '../../../shared/auth/login/recovery/utils/email/sendEmailCode';
import { successMessages } from '../../../shared/auth/succes/successMessages';

export const requestPasswordReset = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { usernameOrEmail } = req.body;
        const inputValidationErrors = validateInputrRequestPassword(usernameOrEmail);
        handleInputValidationErrors(inputValidationErrors);

        const user = await findUseRrequestPassword(usernameOrEmail);
        
        // Type Guard: le dice a TypeScript que desde aquí user NO es null.
        // En tiempo de ejecución nunca pasará por el return porque findUseRrequestPassword lanza un AppError.
        if (!user) return; 

        checkisUserVerified(user);

        const randomPassword = await generateAndSetRandomPassword(user.id);
        await sendPasswordResetEmailPasswordReset(user.email, user.username, randomPassword);

        res.status(200).json({ msg: successMessages.passwordResetEmailSent() });
    } catch (error) {
        next(error);
    }
};