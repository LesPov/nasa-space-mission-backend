
import { Router } from "express";
import { newUser } from "../controllers/registerController";
import { verifyUser } from "../controllers/emailController";
import verifyUserRateLimit from "../../../shared/auth/emails/utils/verifyUserRateLimit";
import { resendVerificationCode } from "../controllers/resendCodeController";
import { getAllCountryCodes } from "../../countries/controllers/paisController";
import { sendVerificationCodePhone } from "../controllers/phoneController";
import { verifyPhoneNumber } from "../controllers/phoneValidateCodeController";
import { resendVerificationCodePhone } from "../controllers/phoneresendCodeController";
import { loginUser } from "../controllers/loginController";
import { requestPasswordReset } from "../controllers/passwordRecoveryController";
import { resetPassword } from "../controllers/resetPasswordController";
import validateToken from "../../../infrastructure/middleware/valdiateToken/validateToken";

const authRouter = Router();
// Rutas existentes para registro 
/**
 * POST /api/user/register
 *  Ruta para registrar un nuevo usuario.
 *  Público
 */
authRouter.post('/register', newUser);

/**
 * PUT /api/user/verify/email
 * Ruta para verificar el correo electrónico.
 * Público
 */
authRouter.put('/verify/email', verifyUserRateLimit, verifyUser);

/**
 * POST /api/user/verify/email/resend
 * Ruta para reenviar el código de verificación por correo electrónico.
 * Público
 */
authRouter.post('/verify/email/resend', verifyUserRateLimit, resendVerificationCode);

// Ruta para obtener todos los códigos de país
authRouter.get('/countries', getAllCountryCodes);

/**
 * POST /api/user/verify/send
 * Ruta para enviar el código de verificación por SMS.
 * Público
 */
authRouter.post("/phone/send", sendVerificationCodePhone);


 
/**
 * PUT /api/user/verify/phone
 * Ruta para verificar el número de teléfono.
 * Público
 */
  authRouter.put('/phone/verify', verifyPhoneNumber);




/**
 * POST /api/user/verify/resend
 * Ruta para reenviar el código de verificación por SMS.
 * Público
 */
 authRouter.post("/phone/verify/resend", resendVerificationCodePhone);

 /**
 * POST /api/user/login
 *  Ruta para iniciar sesión de un usuario.
 *  Público
 *  @body {string} email - Correo electrónico del usuario.
 *  @body {string} password - Contraseña del usuario.
 *  @returns {object} - Token de acceso y detalles del usuario si el inicio de sesión es exitoso.
 */
authRouter.post('/login', loginUser); 


/**
 * POST /api/user/forgot-password
 * Ruta para solicitar un correo electrónico de recuperación de contraseña.
 * Público
 */
authRouter.post('/login/forgotPassword', requestPasswordReset);


/**
 * POST /api/user/reset-password
 * Ruta para cambiar la contraseña después de recibir el correo de recuperación.
 * Público
 */
authRouter.post('/login/resetPassword', validateToken, resetPassword);
export default authRouter;
   