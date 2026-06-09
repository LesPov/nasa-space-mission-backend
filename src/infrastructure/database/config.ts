// src/app/infrastructure/database/config.ts
import { Sequelize } from "sequelize";
import dotenv from 'dotenv';

dotenv.config();

/**
 * Este archivo tiene UNA SOLA RESPONSABILIDAD:
 * Crear y exportar la instancia de Sequelize.
 * No define modelos ni relaciones para evitar dependencias circulares.
 */

const dbName = process.env.DB_NAME || 'motor3d';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || 'admin123';
const dbHost = process.env.DB_HOST || 'localhost';
const dbDialect = process.env.DB_DIALECT || 'mysql';

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: dbDialect as any, // 'as any' para evitar problemas de tipado con los dialectos
    logging: false, // Desactivar logs de SQL en producción
});

export default sequelize;