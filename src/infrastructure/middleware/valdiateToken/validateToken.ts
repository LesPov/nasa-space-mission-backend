// ../middleware/validateToken.ts (Ajusta rutas de importación si es necesario)
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { UserRole } from '../common/enums'; // Asegúrate que la ruta sea correcta
import { errorMessages } from '../../../shared/auth/errors/auth.errors'; // Asegúrate que la ruta sea correcta

// Ya no necesitas definir CustomRequest aquí si usaste la definición global en @types/express

/**
 * Extrae el token JWT del encabezado 'Authorization: Bearer <token>'.
 * @param headerToken El valor completo del encabezado Authorization.
 * @returns El token JWT o null si el formato no es válido o no existe.
 */
const extractBearerToken = (headerToken: string | undefined): string | null => {
  if (headerToken && headerToken.startsWith('Bearer ')) {
    // Retorna solo la parte del token
    return headerToken.slice(7);
  }
  // No hay token o el formato es incorrecto
  return null;
};

/**
 * Verifica la validez del token JWT usando la clave secreta.
 * @param token El token JWT a verificar.
 * @returns El payload decodificado si el token es válido.
 * @throws Error si el token es inválido o expirado, o si falta SECRET_KEY.
 */
const verifyToken = (token: string): JwtPayload | string | undefined => {
  // Es CRUCIAL usar una variable de entorno segura para la clave secreta.
  const secret = process.env.SECRET_KEY;
  if (!secret) {
    console.error("FATAL ERROR: SECRET_KEY no está definida en las variables de entorno.");
    throw new Error("Configuración de servidor incompleta: falta SECRET_KEY.");
  }
  // jwt.verify puede lanzar errores (TokenExpiredError, JsonWebTokenError)
  return jwt.verify(token, secret);
};

/**
 * Middleware para validar el token JWT de autorización.
 * Extrae el token, lo verifica y adjunta la información del usuario a `req.user`.
 * Busca 'userId' y 'rol' en el payload del token.
 * Si no hay token, permite continuar (req.user = null).
 * Si el token existe pero es inválido (firma, expiración, payload incorrecto), responde con 401 o 500.
 */
const validateToken = (req: Request, res: Response, next: NextFunction): void => {
  const headerToken = req.headers['authorization'];
  const token = extractBearerToken(headerToken);

  // Si no se proporciona token en el encabezado
  if (!token) {
    // Permite el acceso anónimo. Las rutas protegidas DEBEN verificar `req.user` después.
    req.user = null;
    return next();
  }

  try {
    // Verifica el token (puede lanzar errores)
    const decoded = verifyToken(token);

    // --- INICIO DE LA MODIFICACIÓN ---
    // Verifica que el payload decodificado tenga la estructura esperada: 'userId' y 'rol'.
    if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded && 'rol' in decoded) {
      // Adjunta la información estandarizada del usuario a la solicitud.
      // Leemos 'userId' del token, pero lo guardamos como 'id' en req.user para consistencia.
      req.user = {
        id: decoded.userId as number, // <-- Lee 'userId'
        rol: decoded.rol as UserRole // <-- Lee 'rol'
      };
      // Asegúrate de que el tipo del ID sea número y el rol sea uno del Enum
      if (typeof req.user.id !== 'number' || !Object.values(UserRole).includes(req.user.rol)) {
          console.error('Tipos inválidos en payload de token JWT:', { id: typeof decoded.userId, rol: decoded.rol });
          // Considera esto también un payload inválido
          res.status(401).json({ msg: errorMessages.invalidToken + " (Payload types)" });
          return; // No llames a next()
      }

      next(); // Token válido y payload correcto, continuar al siguiente middleware/controlador
    } else {
      // El payload del token no tiene la estructura esperada ('userId' y 'rol').
      console.error('Payload de token JWT inválido (estructura incorrecta):', decoded);
      res.status(401).json({ msg: errorMessages.invalidToken + " (Payload structure)" });
    }
    // --- FIN DE LA MODIFICACIÓN ---

  } catch (error) {
    // Captura errores de jwt.verify (ej. token expirado, firma inválida)
    // O errores de configuración (como SECRET_KEY faltante).
    let errorMessage = errorMessages.invalidToken; // Mensaje por defecto para el cliente
    let statusCode = 401; // Por defecto, error de cliente (token inválido)

    if (error instanceof Error) {
        console.error('Error al validar el token:', error.message); // Log interno detallado

        if (error.message.includes("SECRET_KEY")) {
            // Error crítico de configuración -> Error del Servidor
            errorMessage = "Error interno del servidor al procesar la autenticación.";
            statusCode = 500;
        } else if (error.name === 'TokenExpiredError') {
            // Token expirado -> Error del Cliente
            errorMessage = errorMessages.tokenExpired || "El token ha expirado";
            statusCode = 401; // Sigue siendo 401 Unauthorized
        }
        // Otros errores de jwt (JsonWebTokenError como firma inválida) -> Error del Cliente
        // Se manejan con el errorMessage y statusCode por defecto (invalidToken, 401).
    } else {
        // Error inesperado no-estándar -> Error del Servidor
        console.error('Error desconocido al validar el token:', error);
        errorMessage = "Error inesperado durante la autenticación.";
        statusCode = 500;
    }

    // Envía la respuesta de error
    res.status(statusCode).json({ msg: errorMessage });
  }
};

export default validateToken;