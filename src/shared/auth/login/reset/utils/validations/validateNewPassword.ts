
import { AppError } from '../../../../../../infrastructure/errors/app.error';
import { validationRules } from '../../../../register/utils/validations/registrationValidators';
 
export const validateNewPassword = (newPassword: string): string[] => {
    const errors: string[] = [];

    validationRules.forEach(rule => {
        if (!rule.test(newPassword)) {
            errors.push(rule.errorMessage);
        }
    });

    return errors;
};

export const handleNewPasswordValidationErrors = (errors: string[]) => {
    if (errors.length > 0) {
        throw new AppError(errors.join(', '), 400, 'Error en la validación de la newPassword');
    }
};