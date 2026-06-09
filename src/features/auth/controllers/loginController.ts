import { Request, Response } from 'express';
import { validateInputLogin } from '../../../shared/auth/login/verify/utils/validations/loginvalidateInput';
import { handleInputValidationErrors } from '../../../shared/auth/register/utils/invalidations/handleInputValidationErrors';
import { findUserByUsernameLogin, handleUserNotFoundErrorLogin } from '../../../shared/auth/login/verify/utils/findUser/findUserByUsernameLogin';
import { checkUserVerificationStatusEmail, handleEmailNotVerificationErroruser } from '../../../shared/auth/phone/utils/check/checkUserVerificationStatus';
import { checkUserVerificationStatusPhoneLogin, handlePhoneLoginNotVerificationErroruser } from '../../../shared/auth/login/verify/utils/check/checkUserVerificationStatusPhone';
import { handleRandomPasswordValidation } from '../../../shared/auth/login/verify/utils/validations/handleRandomPasswordValidation';
import { handleSuccessfulLogin } from '../../../shared/auth/login/verify/utils/handleSuccessfu/handleSuccessfulLogin';
import { validatePassword } from '../../../shared/auth/login/verify/utils/validations/validatePasswordLogin';
import { handleLoginAttempts } from '../../../shared/auth/login/verify/utils/loginAttempts/loginAttemptsService';
import { handleServerErrorLogin } from '../../../shared/auth/login/verify/utils/errors/handleServerError';

 
/** 
 * Controlador para manejar la solicitud de inicio de sesión de un usuario.
 */
export const loginUser = async (req: Request, res: Response) => {
    try {
      // 1. Extraer y validar los datos de entrada
      const { username, passwordorrandomPassword } = req.body;
      const inputValidationErrors = validateInputLogin(username, passwordorrandomPassword);
      handleInputValidationErrors(inputValidationErrors, res);
  
      // 2. Búsqueda del usuario
      const user = await findUserByUsernameLogin(username);
      if (!user) {
        handleUserNotFoundErrorLogin(username, user, res);
        return;
      }
  
      // 3. Verificación del estado del usuario Email
      const isEmailVerified = checkUserVerificationStatusEmail(user);
      handleEmailNotVerificationErroruser(isEmailVerified, res);
  
      // 4. Verificación del estado del usuario Phone
      const isPhoneNumberVerified = checkUserVerificationStatusPhoneLogin(user);
      handlePhoneLoginNotVerificationErroruser(isPhoneNumberVerified, res);
  
      // 5. Determinar si se está usando una contraseña aleatoria
      // Por ejemplo, suponiendo que la contraseña aleatoria siempre tenga 8 caracteres
      const isRandomPassword = passwordorrandomPassword.length === 8;
  
      if (isRandomPassword) {
        // Validamos la contraseña aleatoria y, si es válida, procesamos el login sin pasar por la validación normal
        const isValidRandom = await handleRandomPasswordValidation(user, passwordorrandomPassword, res);
        if (!isValidRandom) return;
        await handleSuccessfulLogin(user, res, passwordorrandomPassword);
        return; // Termina aquí el flujo para random password
      } else {
        // Flujo normal: validamos la contraseña convencional
        const isPasswordValid = await validatePassword(user, passwordorrandomPassword);
        const loginSuccess = await handleLoginAttempts(user.id, isPasswordValid, res);
        if (loginSuccess) {
          await handleSuccessfulLogin(user, res, passwordorrandomPassword);
        }
      }
    } catch (error) {
      // Manejo de errores de servidor
      handleServerErrorLogin(error, res);
    }
  };
  