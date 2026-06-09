// src/app/features/episodes/models/triggerModel.ts
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../../infrastructure/database/config';
// Ahora importamos los enums reales
import { TriggerAction, TriggerCondition, TriggerInterface } from '../interfaces/triggerInterface';

interface TriggerCreationAttributes extends Optional<TriggerInterface, 'id'> {}

export const TriggerModel = sequelize.define<Model<TriggerInterface, TriggerCreationAttributes>>('Trigger', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    episodeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Nombre único del trigger para ser referenciado en scripts o por otros triggers."
    },
    position: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: "Posición {x, y, z} del centro del trigger en el mundo."
    },
    size: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: "Dimensiones {x, y, z} de la caja de activación del trigger."
    },
    condition: {
        // ¡ESTO AHORA FUNCIONA! Object.values(TriggerCondition) devuelve ['on_enter', 'on_interact', ...]
        type: DataTypes.ENUM(...Object.values(TriggerCondition)),
        allowNull: false,
        comment: "Condición que activa el trigger (ej: al entrar, al interactuar)."
    },
    actionType: {
        // ¡ESTO AHORA FUNCIONA!
        type: DataTypes.ENUM(...Object.values(TriggerAction)),
        allowNull: false,
        comment: "El tipo de acción que se ejecuta cuando el trigger se activa."
    },
    targetObjectName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "El 'name' del SceneObject que será afectado por la acción."
    },
    actionProperties: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Propiedades adicionales para la acción, ej: { animationName: 'abrir' }."
    },
    isRepeatable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: "¿Puede este trigger activarse más de una vez?"
    },
    isEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: "Controla si el trigger está activo. Puede ser modificado por otros triggers."
    },
}, { 
    tableName: 'triggers', 
    timestamps: true 
});