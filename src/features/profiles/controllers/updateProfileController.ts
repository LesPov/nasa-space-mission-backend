
import { NextFunction, Request, Response } from 'express';
import upload from '../../../infrastructure/uploadsfiles/uploadConfig';
import { Op } from 'sequelize';
import { successMessagesCp } from '../../../shared/admin/succes/succesMessagesCp';
import { errorMessages } from '../../../shared/auth/errors/auth.errors';
import { userProfileModel } from '../models/userProfileModel';
import { AppError } from '../../../infrastructure/errors/app.error';

const handleImageUpload = (req: Request, res: Response, callback: (err?: any) => void) => {
    upload(req, res, (err) => {
        if (err) {
            return callback(new AppError(`Error en la subida de la imagen: ${err.message}`, 400, 'Error al cargar la imagen'));
        }
        callback(); 
    });
};

export const validateCampesinoPersonalData = (firstName: string, lastName: string, birthDate: string, gender: string, profilePicture?: string): string[] => {
    const errors: string[] = [];
    if (!firstName || !lastName || !birthDate || !gender) {
        errors.push(errorMessages.requiredFields);
    }
    if (birthDate && isNaN(Date.parse(birthDate))) {
        errors.push("La fecha de nacimiento no es válida.");
    }
    return errors;
};

export const updateProfileController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    handleImageUpload(req, res, async (uploadErr?: any): Promise<void> => {
        try {
            if (uploadErr) throw uploadErr;

            const userId = req.user ? req.user.id : null;
            if (!userId) {
                throw new AppError('Usuario no autenticado', 401);
            }

            const { firstName, lastName, identificationNumber, identificationType, biography, direccion, birthDate, gender, campiamigo } = req.body;
            const profilePicture: string | undefined = req.file?.filename;

            const validationErrors = validateCampesinoPersonalData(firstName, lastName, birthDate, gender, profilePicture);
            if (validationErrors.length > 0) {
                throw new AppError(validationErrors.join(', '), 400, 'Error en la validación de la entrada de datos');
            }

            if (identificationNumber) {
                const duplicateIdentification = await userProfileModel.findOne({ where: { identificationNumber, userId: { [Op.ne]: userId } } });
                if (duplicateIdentification) {
                    throw new AppError('El número de identificación ya está registrado', 400, 'Número de identificación duplicado');
                }
            }

            const duplicateName = await userProfileModel.findOne({ where: { firstName, lastName, userId: { [Op.ne]: userId } } });
            if (duplicateName) {
                throw new AppError('El nombre ya está registrado', 400, 'Nombre duplicado');
            }

            const existingProfile = await userProfileModel.findOne({ where: { userId } });
            if (!existingProfile) {
                throw new AppError('Perfil no encontrado para actualizar', 404);
            }

            const updateData: any = { firstName, lastName, biography, direccion, birthDate, gender };

            if ('campiamigo' in req.body) {
                updateData.campiamigo = campiamigo === true || campiamigo === 'true';
            }
            if (identificationNumber) updateData.identificationNumber = identificationNumber;
            if (identificationType) updateData.identificationType = identificationType;
            if (profilePicture) updateData.profilePicture = profilePicture;

            await existingProfile.update(updateData);
            res.status(200).json({ msg: successMessagesCp.personalDataRegistered });
        } catch (error: any) {
            next(error);
        }
    });
};