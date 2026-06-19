 
import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { validateInputresetPassword } from '../../../shared/auth/login/reset/utils/validations/validateInputResetPassword';
import { handleInputValidationErrors } from '../../../shared/auth/register/utils/invalidations/handleInputValidationErrors';
import { findUseRrequestPassword } from '../../../shared/auth/login/recovery/utils/findUser/findUserPasswordReset';
import { checkisUserVerified } from '../../../shared/auth/login/recovery/utils/check/checkUserVerificationStatus';
import { checkVerificationRandomPassword } from '../../../shared/auth/login/reset/utils/check/checkVerificationRandomPass';
import { checkVerificationCodeExpiration } from '../../../shared/auth/emails/utils/check/checkVerificationCodeExpiration';
import { handleNewPasswordValidationErrors, validateNewPassword } from '../../../shared/auth/login/reset/utils/validations/validateNewPassword';
import { updatePasswordInDatabase } from '../../../shared/auth/login/reset/utils/newPassword/newPassword';
import { removerandomPassword } from '../../../shared/auth/login/reset/utils/remove/removeRandomPassword';
import { successMessages } from '../../../shared/auth/succes/successMessages';

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { usernameOrEmail, randomPassword, newPassword } = req.body;

        const inputValidationErrors = validateInputresetPassword(usernameOrEmail, randomPassword, newPassword);
        handleInputValidationErrors(inputValidationErrors);

        const user = await findUseRrequestPassword(usernameOrEmail);
        
        // Type Guard para silenciar el falso positivo TS18047 de TypeScript
        if (!user) return;

        checkisUserVerified(user);
        checkVerificationRandomPassword(user, randomPassword);
        checkVerificationCodeExpiration(user, new Date());

        const newPasswordValidationErrors = validateNewPassword(newPassword);
        handleNewPasswordValidationErrors(newPasswordValidationErrors);

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await updatePasswordInDatabase(user.id, hashedPassword);
        await removerandomPassword(user.id);

        res.status(200).json({ msg: successMessages.passwordUpdated() });

    } catch (error) {
        next(error);
    }
};