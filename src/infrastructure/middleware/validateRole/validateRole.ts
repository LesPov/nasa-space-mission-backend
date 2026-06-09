import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorMessages } from '../../../shared/auth/errors/auth.errors';
 
const extractToken = (req: Request): string | null => {
  const authHeader = req.headers['authorization'];
  return authHeader ? authHeader.split(' ')[1] : null;
};

const verifyToken = (token: string): any => {
  return jwt.verify(token, process.env.SECRET_KEY || 'pepito123');
};

const validateRole = (allowedRoles: string | string[]) => {
  // Convertir a arreglo en caso de que se reciba un solo rol
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (req: Request, res: Response, next: NextFunction): void => {
    const token = extractToken(req);
    if (!token) {
      res.status(401).json({
        msg: errorMessages.tokenNotProvided,
      });
      return;
    }
    try {
      const decodedToken = verifyToken(token);
      const userRole = decodedToken.rol;
      // Verifica si el rol del usuario está en el arreglo de roles permitidos
      if (rolesArray.includes(userRole)) {
        next();
      } else {
        res.status(403).json({
          msg: errorMessages.accessDenied,
        });
      }
    } catch (error) {
      res.status(401).json({
        msg: errorMessages.invalidToken,
      });
    }
  };
};

export default validateRole;
