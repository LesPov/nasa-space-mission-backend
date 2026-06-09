import { Request, Response } from 'express';
 
import { Op } from 'sequelize';
import { errorMessages } from '../../../shared/auth/errors/auth.errors';
import { userProfileModel } from '../models/userProfileModel';

export const updateMinimalProfileController = async (req: Request, res: Response): Promise<void> => {
    req.body.perfilcampiamigoactualizar = 'perfilcampiamigoactualizar';

  try {
    const userId = req.user ? req.user.id : null; 
    if (!userId) {
      res.status(401).json({ msg: 'Usuario no autenticado' });
      return;
    }

    // Extraemos solo los campos que vamos a actualizar
    const { identificationNumber, identificationType, direccion, campiamigo } = req.body;

    // Validación: aseguramos que identificationNumber, identificationType y direccion se envíen
    const errors: string[] = [];
    if (!identificationNumber) {
      errors.push('El número de identificación es obligatorio.');
    }
    if (!identificationType) {
      errors.push('El tipo de identificación es obligatorio.');
    }
    if (!direccion) {
      errors.push('La dirección es obligatoria.');
    }
    // Validamos campiamigo (acepta "true" o true) y lo convertimos a booleano
    const campiamigoBoolean = campiamigo === true || campiamigo === 'true';

    if (errors.length > 0) {
      res.status(400).json({ msg: errors, error: 'Error en la validación de los datos' });
      return;
    }

    // Verificamos que el número de identificación no esté duplicado en otro perfil
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

    // Buscamos el perfil existente del usuario
    const existingProfile = await userProfileModel.findOne({ where: { userId } });
    if (!existingProfile) {
      res.status(404).json({ msg: 'Perfil no encontrado para actualizar' });
      return;
    }

    // Construimos el objeto de actualización con los 4 campos
    const updateData = {
      identificationNumber,
      identificationType,
      direccion,
      campiamigo: campiamigoBoolean,
    };

    // Actualizamos el perfil
    await existingProfile.update(updateData);

    res.status(200).json({ msg: 'Perfil actualizado correctamente' });
  } catch (error: any) {
    console.error("Error en updateMinimalProfileController:", error);
    res.status(400).json({
      msg: error.message || errorMessages.databaseError,
      error,
    });
  }
};
