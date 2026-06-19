
import { NextFunction, Request, Response } from 'express';
import { errorMessages } from '../../../shared/auth/errors/auth.errors';
import { userProfileModel } from '../models/userProfileModel';
import { AppError } from '../../../infrastructure/errors/app.error';
 
export const getProfileController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user ? req.user.id : null; 
    if (!userId) { 
      throw new AppError('Usuario no autenticado', 401);
    }

    const profile = await userProfileModel.findOne({ where: { userId } });
    if (!profile) {
      throw new AppError('Perfil no encontrado', 404);
    }

    res.status(200).json(profile);
  } catch (error: any) {
    next(error);
  }
};