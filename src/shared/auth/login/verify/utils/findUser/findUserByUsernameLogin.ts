
import { Response } from 'express';
import { AuthModel } from '../../../../../../features/auth/models/authModel';
import { VerificationModel } from '../../../../../../features/auth/models/verificationModel';
import { errorMessages } from '../../../../errors/auth.errors';
 
/**
 * Busca un usuario en la base de datos basado en su nombre de usuario.
 * 
 * @param username - El nombre de usuario del usuario a buscar.
 * @returns El usuario encontrado o `null` si no existe.
 */
export const findUserByUsernameLogin = async (username: string) => {
    return await AuthModel.findOne({
        where: { username },
        include: [
            {
                model: VerificationModel,
                as: 'verification'    // ← el mismo alias que en AuthModel.hasOne(...)
            }
        ]
    });
};


/**
 * Maneja el error cuando un usuario no es encontrado en la base de datos.
 * 
 * @param user - El objeto de usuario retornado por la consulta a la base de datos.
 * @param res - El objeto de respuesta HTTP proporcionado por Express.
 * 
 * @throws Lanza una excepción si el usuario no fue encontrado.
 */
export const handleUserNotFoundErrorLogin = (username: string, user: any, res: Response) => {
    if (!user) {
        const errorMsg = errorMessages.userNotFound(username);
        res.status(404).json({
            msg: errorMsg,
            errors: 'Error: El usuario no fue encontrado en la base de datos.',
        });
        throw new Error("User not found validation failed");
    }
};
