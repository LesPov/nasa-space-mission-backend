import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { UserRole } from '../common/enums'; 
import { errorMessages } from '../../../shared/auth/errors/auth.errors'; 

const extractBearerToken = (headerToken: string | undefined): string | null => {
  if (headerToken && headerToken.startsWith('Bearer ')) {
    return headerToken.slice(7);
  }
  return null;
};

const verifyToken = (token: string): JwtPayload | string | undefined => {
  const secret = process.env.SECRET_KEY;
  if (!secret) {
    throw new Error("CRITICAL_ENV_MISSING");
  }
  return jwt.verify(token, secret);
};

const validateToken = (req: Request, res: Response, next: NextFunction): void => {
  const headerToken = req.headers['authorization'];
  const token = extractBearerToken(headerToken);

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = verifyToken(token);

    if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded && 'rol' in decoded) {
      req.user = {
        id: decoded.userId as number, 
        rol: decoded.rol as UserRole 
      };

      if (typeof req.user.id !== 'number' || !Object.values(UserRole).includes(req.user.rol)) {
          res.status(401).json({ msg: errorMessages.invalidToken + " (Estructura de roles alterada)" });
          return; 
      }

      next(); 
    } else {
      res.status(401).json({ msg: errorMessages.invalidToken + " (Payload inválido)" });
    }
  } catch (error) {
    if (error instanceof Error) {
        if (error.message === "CRITICAL_ENV_MISSING") {
            res.status(500).json({ msg: "Error interno del servidor (Configuración)." });
            return;
        } else if (error.name === 'TokenExpiredError') {
            res.status(401).json({ msg: errorMessages.tokenExpired || "Tu sesión ha expirado. Por favor, inicia sesión de nuevo." });
            return;
        }
    }
    
    res.status(401).json({ msg: errorMessages.invalidToken });
  }
};

export default validateToken;