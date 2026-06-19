
import { AppError } from '../../../../../../infrastructure/errors/app.error';
import { AuthInterface } from '../../../../../../features/auth/interfaces/authInterface';
import { AuthModel } from '../../../../../../features/auth/models/authModel';
import { VerificationModel } from '../../../../../../features/auth/models/verificationModel';
import { errorMessages } from '../../../../errors/auth.errors';
 
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const findUseRrequestPassword = async (usernameOrEmail: string): Promise<AuthInterface | null> => {
    let user;
    if (EMAIL_REGEX.test(usernameOrEmail)) {
        user = await AuthModel.findOne({ where: { email: usernameOrEmail }, include: [VerificationModel] });
    } else {
        user = await AuthModel.findOne({ where: { username: usernameOrEmail }, include: [VerificationModel] });
    }

    if (!user) {
        throw new AppError(errorMessages.userNotFound(usernameOrEmail), 404, 'Error: El usuario no fue encontrado en la base de datos.');
    }

    return user;
};