import { Request, Response } from 'express';
import { errorMessages } from '../../../shared/auth/errors/auth.errors';
import { userProfileModel } from '../models/userProfileModel';
 
export const getProfileController = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extraemos el userId del token (ya validado por el middleware)
    const userId = req.user ? req.user.id : null; 
    if (!userId) { 
      res.status(401).json({ msg: 'Usuario no autenticado' }); 
      return;
    }

    // Buscamos el perfil del usuario en la base de datos
    const profile = await userProfileModel.findOne({ where: { userId } });
    if (!profile) {
      res.status(404).json({ msg: 'Perfil no encontrado' });
      return;
    }

    // Retornamos el perfil encontrado
    res.status(200).json(profile);
  } catch (error: any) {
    console.error("Error en getProfileController:", error);
    res.status(500).json({
      msg: error.message || errorMessages.databaseError,
      error,
    });
  }
};
