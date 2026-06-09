import { Request, Response } from 'express';
import { handleUserNotFoundError } from '../../../shared/auth/emails/utils/errors/handleUserNotFoundError';
import { findUserByUsername } from '../../../shared/auth/emails/utils/findUser/findUserByUsername';
import { sendVerificationEmail } from '../../../shared/auth/register/utils/validations/sendVerificationEmail';
import { createOrUpdateVerificationEntry } from '../../../shared/auth/emails/utils/createOrUpdateVerificationEntry';
import { handleServerErrorRsend } from '../../../shared/auth/emails/utils/errors/handleServerErrorRsend';
  
export const resendVerificationCode = async (req: Request, res: Response) => {
    try {
        const { username } = req.body;

        //Busca un usuario en la base de datos basado en su nombre de usuario.
        const user = await findUserByUsername(username);
        // Maneja el error si el usuario no existe
        handleUserNotFoundError(username, user, res);

        if (!user) return; // Si user es null, sale de la función

        // Generar y guardar un código de verificación para el correo electrónico del usuario
        const newVerificationCode = await createOrUpdateVerificationEntry(user.id);

        // Enviar el correo electrónico de verificación al usuario con el nuevo código
        await sendVerificationEmail(user.email, username, newVerificationCode);

        // Mensaje de éxito
        res.json({
            msg: 'Código de verificación reenviado exitosamente.',
        });

    } catch (error: any) {
        // Manejar errores generales del servidor y responder con un mensaje de error
        handleServerErrorRsend(error, res);
    }

};