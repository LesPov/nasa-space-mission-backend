import { Request, Response } from 'express';
import upload from '../../../infrastructure/uploadsfiles/uploadConfig';
import { Op } from 'sequelize';
import { successMessagesCp } from '../../../shared/admin/succes/succesMessagesCp';
import { errorMessages } from '../../../shared/auth/errors/auth.errors';
import { userProfileModel } from '../models/userProfileModel';
 
// Función para manejar la subida de imagen
const handleImageUpload = (req: Request, res: Response, callback: () => Promise<void>) => {
    upload(req, res, (err) => {
        if (err) {
            console.error(`Error en la subida de la imagen: ${err.message}`);
            return res.status(400).json({
                msg: `Error en la subida de la imagen: ${err.message}`,
                errors: 'Error al cargar la imagen',
            });
        }
        callback(); 
    });
};

// Función de validación actualizada (ver sección anterior)
export const validateCampesinoPersonalData = (
    firstName: string,
    lastName: string,
    birthDate: string,
    gender: string,
    profilePicture?: string
): string[] => {
    const errors: string[] = [];
    if (!firstName || !lastName || !birthDate || !gender) {
        errors.push(errorMessages.requiredFields);
    }
    if (birthDate && isNaN(Date.parse(birthDate))) {
        errors.push("La fecha de nacimiento no es válida.");
    }
    return errors;
};

export const processValidationErrors = (errors: string[], res: Response): void => {
    if (errors.length > 0) {
        res.status(400).json({
            msg: errors,
            error: 'Error en la validación de la entrada de datos',
        });
        throw new Error("Input validation failed");
    }
};

export const processServerError = (error: any, res: Response) => {
    console.error("Error en updateProfileController:", error);
    if (!res.headersSent) {
        res.status(400).json({
            msg: error.message || errorMessages.databaseError,
            error,
        });
        throw new Error("Controller updateProfileController error");
    } 
};

export const sendSuccessResponse = (message: string, res: Response): void => {
    res.status(200).json({ msg: message });
};

/**
 * Controlador PUT para actualizar los datos personales del usuario.
 * Se asume que el perfil ya existe. Si no se encuentra, se retorna un 404.
 */
export const updateProfileController = async (req: Request, res: Response): Promise<void> => {
 
    handleImageUpload(req, res, async (): Promise<void> => {
        try {
            const userId = req.user ? req.user.id : null;
            if (!userId) {
                res.status(401).json({ msg: 'Usuario no autenticado' });
                return;
            }

            // Extraemos los datos enviados
            const {
                firstName,
                lastName,
                identificationNumber,
                identificationType,
                biography,
                direccion,
                birthDate,
                gender,
                campiamigo,
            } = req.body;

            // Extraemos la imagen solo si se subió
            const profilePicture: string | undefined = req.file?.filename;

            // Validamos los datos obligatorios sin exigir identificación
            const validationErrors = validateCampesinoPersonalData(
                firstName,
                lastName,
                birthDate,
                gender,
                profilePicture
            );
            processValidationErrors(validationErrors, res);

            // Verificamos duplicados: número de identificación solo si se envía
            if (identificationNumber) {
                const duplicateIdentification = await userProfileModel.findOne({
                    where: {
                        identificationNumber,
                        userId: { [Op.ne]: userId }
                    }
                });
                if (duplicateIdentification) {
                    res.status(400).json({
                        msg: 'El número de identificación ya está registrado',
                        error: 'Número de identificación duplicado'
                    });
                    return;
                }
            }

            // Opcional: verificación de nombre y apellido
            const duplicateName = await userProfileModel.findOne({
                where: {
                    firstName,
                    lastName,
                    userId: { [Op.ne]: userId }
                }
            });
            if (duplicateName) {
                res.status(400).json({ 
                    msg: 'El nombre ya está registrado',
                    error: 'Nombre duplicado'
                });
                return;
            }

            // Buscamos el perfil existente del usuario
            // Buscamos el perfil existente del usuario
            const existingProfile = await userProfileModel.findOne({ where: { userId } });
            if (!existingProfile) {
                res.status(404).json({ msg: 'Perfil no encontrado para actualizar' });
                return;
            }

            // Construimos el objeto de actualización; incluimos solo los campos obligatorios
            const updateData: any = {
                firstName,
                lastName,
                biography,
                direccion,
                birthDate,
                gender,
            };

            if ('campiamigo' in req.body) {
                const campiamigoBoolean = campiamigo === true || campiamigo === 'true';
                updateData.campiamigo = campiamigoBoolean;
              }
              

            if (identificationNumber) {
                updateData.identificationNumber = identificationNumber;
            }
            if (identificationType) {
                updateData.identificationType = identificationType;
            }
            if (profilePicture) {
                updateData.profilePicture = profilePicture;
            }

            // Actualizamos el perfil existente
            await existingProfile.update(updateData);


        sendSuccessResponse(successMessagesCp.personalDataRegistered, res);
            return; 
        } catch (error: any) {
            processServerError(error, res);
            return;
        }
    });
};
