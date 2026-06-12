// src/features/auth/models/authModel.ts

import { DataTypes } from 'sequelize';
import { AuthInterface } from '../interfaces/authInterface'; 
import { UserRole, UserStatus } from '../../../infrastructure/middleware/common/enums';
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
        // 🔥 SOLUCIÓN: Quitamos unique: true de aquí para evitar el bug de Sequelize con alter: true.
        // La unicidad ahora se maneja en el array "indexes" al final del archivo.
    },
    /**
     * Hash de la contraseña del usuario. Requerido.
     */
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    /**
     * Correo electrónico único del usuario. Requerido.
     */
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true, 
        },
        // 🔥 SOLUCIÓN: Quitamos unique: true de aquí.
    },
    /**
     * Número de teléfono único del usuario. Opcional.
     */
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true, 
        // 🔥 SOLUCIÓN: Quitamos unique: true de aquí.
    },
    /**
     * Rol del usuario dentro de la aplicación. Requerido.
     */
    rol: {
        type: DataTypes.ENUM(...Object.values(UserRole)), 
        allowNull: false,
    },
    /**
     * Estado de activación del usuario (Activado/Desactivado). Requerido.
     */
    status: {
        type: DataTypes.ENUM(...Object.values(UserStatus)), 
        allowNull: false,
        defaultValue: UserStatus.Active, 
    },
}, {
    tableName: 'auth',
    timestamps: true, 

    /**
     * 🔥 SOLUCIÓN DEFINITIVA AL ERROR DE LOS ÍNDICES (ER_TOO_MANY_KEYS):
     * Declarar los índices con nombres fijos aquí abajo le dice a Sequelize 
     * exactamente cómo se llaman. Así, al usar alter: true, Sequelize sabe 
     * que ya existen y no intenta crear "username_1", "username_2", etc.
     */
    indexes: [
        {
            unique: true,
            name: 'auth_email_unique_idx',
            fields: ['email']
        },
        {
            unique: true,
            name: 'auth_username_unique_idx',
            fields: ['username']
        },
        {
            unique: true,
            name: 'auth_phoneNumber_unique_idx',
            fields: ['phoneNumber']
        }
    ],
});