
import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { validateInput, validatePassword, validateEmail } from '../../../shared/auth/register/utils/validations/registrationValidators';
import { checkExistingUserOrEmail } from '../../../shared/auth/register/utils/validations/validateEmail';
import { handleEmailValidationErrors } from '../../../shared/auth/register/utils/invalidations/handleEmailValidationErrors';
import { handleExistingUserError } from '../../../shared/auth/register/utils/invalidations/handleExistingUserError';
import { handleInputValidationErrors } from '../../../shared/auth/register/utils/invalidations/handleInputValidationErrors';
import { handlePasswordValidationErrors } from '../../../shared/auth/register/utils/invalidations/handlePasswordValidationErrors';
import { createNewUser } from '../../../shared/auth/register/utils/validations/createNewUser';
import { createVerificationEntry } from '../../../shared/auth/register/utils/validations/createVerificationEntry';
import { getRoleMessage } from '../../../shared/auth/register/utils/validations/getRoleMessage';
import { initializeUserProfile } from '../../../shared/auth/register/utils/validations/initializeUserProfile';
import { sendVerificationEmail } from '../../../shared/auth/register/utils/validations/sendVerificationEmail';
import { successMessages } from '../../../shared/auth/succes/successMessages';

export const newUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, password, email, rol } = req.body;

        const inputValidationErrors = validateInput(username, password, email, rol);
        handleInputValidationErrors(inputValidationErrors);

        const passwordValidationErrors = validatePassword(password);
        handlePasswordValidationErrors(passwordValidationErrors);

        const emailErrors = validateEmail(email);
        handleEmailValidationErrors(emailErrors);

        const existingUserError = await checkExistingUserOrEmail(username, email);
        handleExistingUserError(existingUserError);

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await createNewUser(username, hashedPassword, email, rol);

        await initializeUserProfile(newUser.id);
        const verificationCode = await createVerificationEntry(newUser.id, email);
        await sendVerificationEmail(email, username, verificationCode);

        const userMessage = getRoleMessage(rol);

        res.status(201).json({
            msg: successMessages.userRegistered(username, userMessage),
        });
    } catch (error) {
        next(error);
    }
};