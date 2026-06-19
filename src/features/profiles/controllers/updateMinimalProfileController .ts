
import { NextFunction, Request, Response } from 'express';
import { Op } from 'sequelize';
import { userProfileModel } from '../models/userProfileModel';
import { AppError } from '../../../infrastructure/errors/app.error';

export const updateMinimalProfileController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    req.body.perfilcampiamigoactualizar = 'perfilcampiamigoactualizar';

  try {
    const userId = req.user ? req.user.id : null; 
    if (!userId) {
      throw new AppError('Usuario no autenticado', 401);
    }

    const { identificationNumber, identificationType, direccion, campiamigo } = req.body;
    const errors: string[] = [];
    if (!identificationNumber) errors.push('El número de identificación es obligatorio.');
    if (!identificationType) errors.push('El tipo de identificación es obligatorio.');
    if (!direccion) errors.push('La dirección es obligatoria.');

    const campiamigoBoolean = campiamigo === true || campiamigo === 'true';

    if (errors.length > 0) {
      throw new AppError(errors.join(', '), 400, 'Error en la validación de los datos');
    }

    const duplicateIdentification = await userProfileModel.findOne({
      where: { identificationNumber, userId: { [Op.ne]: userId } }
    });

    if (duplicateIdentification) {
      throw new AppError('El número de identificación ya está registrado', 400, 'Número de identificación duplicado');
    }

    const existingProfile = await userProfileModel.findOne({ where: { userId } });
    if (!existingProfile) {
      throw new AppError('Perfil no encontrado para actualizar', 404);
    }

    const updateData = {
      identificationNumber,
      identificationType,
      direccion,
      campiamigo: campiamigoBoolean,
    };

    await existingProfile.update(updateData);
    res.status(200).json({ msg: 'Perfil actualizado correctamente' });
  } catch (error: any) {
    next(error);
  }
};