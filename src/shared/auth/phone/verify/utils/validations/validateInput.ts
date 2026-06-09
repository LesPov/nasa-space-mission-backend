import { errorMessages } from '../../../../errors/auth.errors';

export const validateInputVerifyCode = (username: string, phoneNumber: string, verificationCode: string): string[] => {
    const errors: string[] = [];
    if (!username || !phoneNumber || !verificationCode) {
        errors.push(errorMessages.requiredFields);
    }
    return errors;
};