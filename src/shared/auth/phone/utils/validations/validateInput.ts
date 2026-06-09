import { errorMessages } from '../../../errors/auth.errors';

export const validateInput = (username: string, phoneNumber:boolean ): string[] => {
    const errors: string[] = [];
    if (!username || !phoneNumber ) {
        errors.push(errorMessages.requiredFields);
    }
    return errors;
};