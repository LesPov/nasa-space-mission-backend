import { AuthModel } from "../../../../../../features/auth/models/authModel";
import { errorMessages } from "../../../../errors/auth.errors";

 
export const updatePasswordInDatabase = async (userId: number, hashedPassword: string) => {
    try {
        // Actualiza la contraseña en la base de datos para el usuario correspondiente
        return await AuthModel.update({ password: hashedPassword }, {
            where: { id: userId }
        });
    } catch (error) {
        // Manejar errores al interactuar con la base de datos
        console.error('Error al actualizar la contraseña:', error);
        throw new Error(errorMessages.databaseError);
    }
};