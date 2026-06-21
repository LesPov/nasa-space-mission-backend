import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../../infrastructure/database/config';
import { PlayerStateInterface } from '../interfaces/playerStateInterface';

// Opcional: para la creación, algunos campos pueden ser omitidos
interface PlayerStateCreationAttributes extends Optional<PlayerStateInterface, 'id' | 'worldState' | 'inventory' | 'slot'> {}

export const PlayerStateModel = sequelize.define<Model<PlayerStateInterface, PlayerStateCreationAttributes>>('PlayerState', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    episodeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    slot: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: "Slot de guardado (1, 2, 3) para permitir múltiples partidas."
    },
    lastPosition: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: "Última posición guardada del jugador {x, y, z}."
    },
    worldState: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
        comment: "Estado de los objetos del mundo, ej: { 'puerta_abierta': true }."
    },
    inventory: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        comment: "Array de IDs de Assets que el jugador ha recogido."
    },
}, { 
    tableName: 'player_states', 
    timestamps: true, // `updatedAt` se convierte en la fecha del guardado
    // Un índice compuesto para asegurar que un jugador solo tenga una partida por slot en un episodio
    indexes: [
        {
            unique: true,
            fields: ['userId', 'episodeId', 'slot']
        }
    ]
});

// 🔥 FIX: Sincronizar automáticamente la tabla de estado del jugador para evitar el Error 500 al entrar
PlayerStateModel.sync({ alter: true })
    .then(() => console.log('[PlayerStateModel] Tabla sincronizada correctamente'))
    .catch(err => console.error('[PlayerStateModel] Error en sincronización:', err));