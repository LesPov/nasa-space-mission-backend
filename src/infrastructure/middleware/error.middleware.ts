
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app.error';

/**
 * Middleware Global de Manejo de Errores.
 * Atrapa cualquier error lanzado en la aplicación y centraliza la respuesta HTTP.
 * Previene el crash de Node.js por promesas no capturadas.
 */
export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction): void => {
    // Si la respuesta ya fue enviada por algún motivo, delegamos al manejador nativo de Express
    if (res.headersSent) {
        return next(err);
    }

    // Manejo de nuestros errores controlados (Lógica de negocio)
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            msg: err.message,
            errors: err.errors
        });
        return;
    }

    // Registro de errores críticos no previstos
    console.error(`[Error Crítico] ${req.method} ${req.url} -`, err);

    // Fallback genérico para evitar filtrado de stacktraces al cliente
    res.status(500).json({
        msg: 'Error interno del servidor al procesar la solicitud.',
        error: err.message || 'Error desconocido'
    });
};