
import { NextFunction, Request, Response } from 'express';
import { validateInputLogin } from '../../../shared/auth/login/verify/utils/validations/loginvalidateInput';
import { handleInputValidationErrors } from '../../../shared/auth/register/utils/invalidations/handleInputValidationErrors';
import { findUserByUsernameLogin } from '../../../shared/auth/login/verify/utils/findUser/findUserByUsernameLogin';
import { checkUserVerificationStatusEmail } from '../../../shared/auth/phone/utils/check/checkUserVerificationStatus';
import { handleRandomPasswordValidation } from '../../../shared/auth/login/verify/utils/validations/handleRandomPasswordValidation';
import { handleSuccessfulLogin } from '../../../shared/auth/login/verify/utils/handleSuccessfu/handleSuccessfulLogin';
import { validatePassword } from '../../../shared/auth/login/verify/utils/validations/validatePasswordLogin';
import { handleLoginAttempts } from '../../../shared/auth/login/verify/utils/loginAttempts/loginAttemptsService';

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, passwordorrandomPassword } = req.body;
      const inputValidationErrors = validateInputLogin(username, passwordorrandomPassword);
      handleInputValidationErrors(inputValidationErrors);
  
      const user = await findUserByUsernameLogin(username);
  
      checkUserVerificationStatusEmail(user);
      checkUserVerificationStatusEmail(user);
  
      const isRandomPassword = passwordorrandomPassword.length === 8;
  
      if (isRandomPassword) {
        await handleRandomPasswordValidation(user, passwordorrandomPassword);
        const loginData = handleSuccessfulLogin(user, passwordorrandomPassword);
        res.status(200).json(loginData);
        return; 
      } else {
        const isPasswordValid = await validatePassword(user, passwordorrandomPassword);
        const loginSuccess = await handleLoginAttempts(user.id, isPasswordValid);
        if (loginSuccess) {
          const loginData = handleSuccessfulLogin(user, passwordorrandomPassword);
          res.status(200).json(loginData);
        }
      }
    } catch (error) {
      next(error);
    }
};