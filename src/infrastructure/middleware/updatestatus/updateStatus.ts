
import { NextFunction, Request, Response } from 'express';
import { AuthModel } from '../../../features/auth/models/authModel';
import { UserStatus } from '../common/enums';
import { AppError } from '../../errors/app.error';
 
export const updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) { 
      throw new AppError('No autorizado. Se requiere iniciar sesión.', 401);
    }

    const userId = req.user.id;
    const { status } = req.body;

    if (!status || (status !== UserStatus.Active && status !== UserStatus.Inactive)) {
      throw new AppError(`Valor de status inválido. Debe ser '${UserStatus.Active}' o '${UserStatus.Inactive}'.`, 400);
    }

    const [affectedRows] = await AuthModel.update({ status: status }, { where: { id: userId } });

    if (affectedRows === 0) {
      throw new AppError('Usuario no encontrado o el estado ya era el solicitado.', 404);
    }

    res.status(200).json({ msg: 'Estado del usuario actualizado correctamente.', newStatus: status });

  } catch (error) {
    next(error);
  }
};
