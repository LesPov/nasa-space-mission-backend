import { errorMessages } from '../../../../errors/auth.errors';

export const validateInputrRequestPassword= (usernameOrEmail: string): string[] => {
    const errors: string[] = [];
    if (!usernameOrEmail) {
        errors.push(errorMessages.requiredFields);
    }
    return errors;
};
