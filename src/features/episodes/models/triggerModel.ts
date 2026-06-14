import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../../infrastructure/database/config';
import { TriggerAction, TriggerCondition, TriggerInterface } from '../interfaces/triggerInterface';

interface TriggerCreationAttributes extends Optional<TriggerInterface, 'id' | 'uid'> {}

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
    uid: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        comment: 'ID único del trigger en el Frontend'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Nombre único del trigger para ser referenciado en scripts o por otros triggers."
    },
    parentId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "El UID del nodo padre al que está atado este trigger." 
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
        type: DataTypes.ENUM(...Object.values(TriggerCondition)),
        allowNull: false,
        comment: "Condición que activa el trigger (ej: al entrar, al interactuar)."
    },
    actionType: {
        type: DataTypes.ENUM(...Object.values(TriggerAction)),
        allowNull: false,
        comment: "El tipo de acción que se ejecuta cuando el trigger se activa."
    },
    targetObjectName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "El 'uid' o 'name' del SceneObject que será afectado por la acción."
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