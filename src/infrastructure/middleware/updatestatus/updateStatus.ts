// ../controllers/updateStatus.ts (Ajusta rutas de importación)
import { Request, Response } from 'express';
import { AuthModel } from '../../../features/auth/models/authModel';
import { UserStatus } from '../common/enums';
 
// Ya no necesitas importar CustomRequest si usas la definición global
// import { CustomRequest } from '../../../auth/middleware/valdiateToken/validateToken'; // No es necesario

/**
 * Controlador para actualizar el estado (Activado/Desactivado) de un usuario autenticado.
 * Requiere que el middleware `validateToken` se haya ejecutado previamente
 * y haya adjuntado la información del usuario a `req.user`.
 */
export const updateStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Verificar Autenticación (confiando en el middleware `validateToken`)
    // La definición global de `Express.Request` ahora incluye `user?`.
    // El middleware `validateToken` pone `null` si no hay token, o el objeto user si es válido.
    // ESTA RUTA REQUIERE AUTENTICACIÓN, por lo tanto, `req.user` NO debe ser null.
    if (!req.user) { // Comprobación explícita requerida aquí
      res.status(401).json({ msg: 'No autorizado. Se requiere iniciar sesión.' });
      return;
    }

    // 2. Obtener el ID del usuario desde el token verificado (forma estandarizada)
    // Ya no necesitamos `userId || id` porque `validateToken` ahora siempre usa `id`.
    const userId = req.user.id;
    // No necesitamos la validación `!userId` porque si `req.user` existe, `id` también debería existir (según `validateToken`).

    // 3. Obtener y Validar el nuevo estado desde el body de la petición
    const { status } = req.body;

    // Validar que el 'status' proporcionado sea uno de los valores permitidos por el Enum
    if (!status || (status !== UserStatus.Active && status !== UserStatus.Inactive)) {
      res.status(400).json({
        msg: `Valor de status inválido. Debe ser '${UserStatus.Active}' o '${UserStatus.Inactive}'.`
      });
      return;
    }

    // 4. Actualizar el estado en la Base de Datos
    const [affectedRows] = await AuthModel.update(
      // El objeto a actualizar. Usa el valor validado de 'status'.
      // Sequelize manejará el tipo Enum correctamente aquí.
      { status: status },
      // La condición para encontrar el usuario a actualizar.
      { where: { id: userId } }
    );

    // 5. Verificar si la actualización fue exitosa
    if (affectedRows === 0) {
      // Esto puede ocurrir si el userId del token ya no existe en la BD (poco probable pero posible)
      // O si el estado ya era el que se intentó establecer.
      // Considera si quieres distinguir estos casos. Por ahora, 404 es razonable.
      res.status(404).json({ msg: 'Usuario no encontrado o el estado ya era el solicitado.' });
      return;
    }

    // 6. Responder con éxito
    res.json({ msg: 'Estado del usuario actualizado correctamente.', newStatus: status });

  } catch (error) {
    // 7. Manejo de Errores Inesperados
    console.error('Error en updateStatus controller:', error); // Loguea el error completo para depuración interna
    res.status(500).json({ msg: 'Error interno del servidor al intentar actualizar el estado.' }); // Mensaje genérico al cliente
  }
};