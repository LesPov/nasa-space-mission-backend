
import { errorMessages } from '../../../../errors/auth.errors';
import { VerificationModel } from '../../../../../../features/auth/models/verificationModel';
import { AppError } from '../../../../../../infrastructure/errors/app.error';
 
const MAX_LOGIN_ATTEMPTS = 5;
const BLOCK_DURATION_MINUTES = 30;

const resetLoginAttempts = async (userId: number): Promise<void> => {
    await VerificationModel.update({ loginAttempts: 0, blockExpiration: null }, { where: { userId } });
};

const isAccountBlocked = (verification: any): boolean => {
    if (verification.blockExpiration && new Date() < verification.blockExpiration) {
        const remainingTime = Math.ceil((verification.blockExpiration.getTime() - new Date().getTime()) / 60000);
        throw new AppError(errorMessages.accountBlocked(remainingTime), 403, `Error: Cuenta bloqueada. Intente nuevamente en ${remainingTime} minutos.`);
    }
    return false;
};

export const handleLoginAttempts = async (userId: number, isPasswordValid: boolean): Promise<boolean> => {
    const verification = await VerificationModel.findOne({ where: { userId } });
    if (!verification) throw new AppError('Registro de verificación no encontrado', 404);

    isAccountBlocked(verification);

    if (isPasswordValid) {
        await resetLoginAttempts(userId);
        return true;
    } else {
        verification.loginAttempts += 1;

        if (verification.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
            verification.blockExpiration = new Date(Date.now() + BLOCK_DURATION_MINUTES * 60000);
            verification.loginAttempts = 0; 
            await verification.save();
            throw new AppError(errorMessages.maxAttemptsReached, 403, `Error: Máximo de intentos alcanzado. Cuenta bloqueada por ${BLOCK_DURATION_MINUTES} minutos.`);
        } else {
            await verification.save();
            const remainingAttempts = MAX_LOGIN_ATTEMPTS - verification.loginAttempts;
            throw new AppError(errorMessages.incorrectPassword(remainingAttempts), 401, `Error: Contraseña incorrecta. Le quedan ${remainingAttempts} intentos.`);
        }
    }
};