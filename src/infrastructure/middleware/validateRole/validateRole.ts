import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorMessages } from '../../../shared/auth/errors/auth.errors';
 
const extractToken = (req: Request): string | null => {
  const authHeader = req.headers['authorization'];
  return authHeader ? authHeader.split(' ')[1] : null;
};

const verifyToken = (token: string): any => {
  // 🔥 SEGURIDAD: Eliminamos el respaldo inseguro
  const secret = process.env.SECRET_KEY;
  if (!secret) {
      throw new Error("Configuración de servidor incompleta: falta SECRET_KEY.");
  }
  return jwt.verify(token, secret);
};

const validateRole = (allowedRoles: string | string[]) => {
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
      
      if (rolesArray.includes(userRole)) {
        next();
      } else {
        res.status(403).json({
          msg: errorMessages.accessDenied,
        });
      }
    } catch (error: any) {
      // Diferenciar expiración de manipulación
      if (error.name === 'TokenExpiredError') {
         res.status(401).json({ msg: errorMessages.tokenExpired });
      } else {
         res.status(401).json({ msg: errorMessages.invalidToken });
      }
    }
  };
};

export default validateRole;