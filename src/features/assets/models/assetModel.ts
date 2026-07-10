import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../../infrastructure/database/config';
import { AssetInterface } from '../../assets/interfaces/assetInterface';

// Solo omitimos el ID al momento de crear, ya que se autogenera
type AssetCreationAttributes = Optional<AssetInterface, 'id'>;

export const AssetModel = sequelize.define<Model<AssetInterface, AssetCreationAttributes>>('Asset', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        // 🔥 FIX ERROR 500: Cambiamos de ENUM a STRING.
        // Sequelize se bloquea al hacer inserciones si los ENUM se alteran.
        type: DataTypes.STRING,
        allowNull: false,
    },
    path: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    sourceType: {
        // 🔥 FIX ERROR 500: Cambiamos de ENUM a STRING.
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'LOCAL'
    }
}, { tableName: 'assets', timestamps: true });