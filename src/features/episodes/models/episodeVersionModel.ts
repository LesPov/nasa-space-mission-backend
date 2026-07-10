import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../../infrastructure/database/config';
import { EpisodeVersionInterface } from '../../narrative/interfaces/narrativeInterfaces';
// IMPORT CORREGIDO: Apunta localmente, evitando el error MODULE_NOT_FOUND
import { EpisodeVersionStatus } from '../../narrative/interfaces/enums';

type EpisodeVersionCreationAttributes = Optional<EpisodeVersionInterface, 'id'>;

export const EpisodeVersionModel = sequelize.define<Model<EpisodeVersionInterface, EpisodeVersionCreationAttributes>>('EpisodeVersion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    episodeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    versionNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    status: {
        type: DataTypes.ENUM(...Object.values(EpisodeVersionStatus)),
        allowNull: false,
        defaultValue: EpisodeVersionStatus.DRAFT,
    },
    changelog: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, { 
    tableName: 'episode_versions', 
    timestamps: true 
});