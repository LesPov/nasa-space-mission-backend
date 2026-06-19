
import { AppError } from '../../../../../../infrastructure/errors/app.error';
import { AuthModel } from '../../../../../../features/auth/models/authModel';
import { VerificationModel } from '../../../../../../features/auth/models/verificationModel';
import { errorMessages } from '../../../../errors/auth.errors';
 
export const findUserByUsernameLogin = async (username: string) => {
    const user = await AuthModel.findOne({
        where: { username },
        include: [{ model: VerificationModel, as: 'verification' }]
    });

    if (!user) {
        throw new AppError(errorMessages.userNotFound(username), 404, 'Error: El usuario no fue encontrado en la base de datos.');
    }
    return user;
};