import jwt from 'jsonwebtoken';
import { successMessages } from '../../../../succes/successMessages';
 
export const handleSuccessfulLogin = (user: any, password: string) => {
    const msg = password.length === 8 ? 'Inicio de sesión por recuperación de contraseña' : successMessages.userLoggedIn;
    const token = generateAuthToken(user);
    const userId = user.id;
    const rol = user.rol;
    const passwordorrandomPassword = password.length === 8 ? 'randomPassword' : undefined;

    return { msg, token, userId, rol, passwordorrandomPassword };
};

export const generateAuthToken = (user: any) => {
    // 🔥 SEGURIDAD: Eliminamos clave hardcodeada "pepito123" y obligamos a usar env
    const secret = process.env.SECRET_KEY;
    if (!secret) {
        throw new Error("CRÍTICO: SECRET_KEY no está definida en las variables de entorno.");
    }

    // 🔥 SEGURIDAD: Añadimos expiración obligatoria de 24 horas al token
    return jwt.sign({
        username: user.username,
        rol: user.rol,
        userId: user.id
    }, secret, { expiresIn: '24h' });
};