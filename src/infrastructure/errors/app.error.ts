
/**
 * Clase de Error Personalizada para el Backend.
 * Permite a la lógica de negocio lanzar errores con un código HTTP específico
 * sin estar acoplados a la capa de Express (req, res).
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly errors?: any;

    constructor(message: string, statusCode: number = 500, errors?: any) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}