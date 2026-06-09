// ../models/authModel.ts (Ajusta la ruta de importación del enum)
import { DataTypes } from 'sequelize';
import { AuthInterface } from '../interfaces/authInterface'; // Asume que esta interfaz existe y es correcta
 import { UserRole, UserStatus } from '../../../infrastructure/middleware/common/enums';
import { EpisodeModel } from '../../episodes/models/episodeModel';
import { PlayerStateModel } from '../../episodes/models/playerStateModel';
import sequelize from '../../../infrastructure/database/config';

/**
 * Definición del modelo de autenticación (`AuthModel`) utilizando Sequelize.
 * Representa la tabla `auth` que almacena credenciales y metadatos del usuario.
 *
 * @model AuthModel
 * @interface AuthInterface
 */
export const AuthModel = sequelize.define<AuthInterface>('auth', {
    /**
     * ID único del usuario (PK). Autoincremental.
     */
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    /**
     * Nombre de usuario único. Requerido.
     */
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Asegura unicidad a nivel de base de datos
    },
    /**
     * Hash de la contraseña del usuario. Requerido.
     * IMPORTANTE: Nunca almacenar contraseñas en texto plano. Asegúrate de usar bcrypt u otro hash seguro.
     */
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    /**
     * Correo electrónico único del usuario. Requerido.
     * Utilizado para comunicación y potencialmente recuperación de cuenta.
     */
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Asegura unicidad a nivel de base de datos
        validate: {
            isEmail: true, // Añade validación de formato de email a nivel de Sequelize
        },
    },
    /**
     * Número de teléfono único del usuario. Opcional.
     */
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true, // Es opcional
        unique: true, // Si se proporciona, debe ser único
    },
    /**
     * Rol del usuario dentro de la aplicación. Requerido.
     * Determina los permisos y capacidades del usuario.
     * Utiliza el enum UserRole para consistencia y claridad.
     */
    rol: {
        type: DataTypes.ENUM(...Object.values(UserRole)), // Usa los valores del enum
        allowNull: false,
    },
    /**
     * Estado de activación del usuario (Activado/Desactivado). Requerido.
     * Controla si el usuario puede iniciar sesión o interactuar con el sistema.
     * Utiliza el enum UserStatus para consistencia.
     * Por defecto, un nuevo usuario está 'Activado'.
     */
    status: {
        type: DataTypes.ENUM(...Object.values(UserStatus)), // Usa los valores del enum
        allowNull: false,
        defaultValue: UserStatus.Active, // Usa el valor del enum para el default
    },
}, {
    /**
     * Nombre explícito de la tabla en la base de datos.
     */
    tableName: 'auth',
    /**
     * Habilita las columnas automáticas `createdAt` y `updatedAt`.
     * `createdAt`: Timestamp de cuándo se creó el registro.
     * `updatedAt`: Timestamp de la última actualización del registro.
     * Es útil para rastrear cambios, como la actualización de estado.
     */
    timestamps: true, // Mantenlo en true si quieres createdAt y updatedAt
    // timestamps: false, // Si NO quieres createdAt y updatedAt (comentario original era incorrecto)

    /**
     * Opcional: Añadir índices para mejorar el rendimiento de las búsquedas frecuentes.
     * Por ejemplo, si buscas usuarios por email o username a menudo.
     */
    // indexes: [
    //   { unique: true, fields: ['email'] },
    //   { unique: true, fields: ['username'] },
    // ],
}); 