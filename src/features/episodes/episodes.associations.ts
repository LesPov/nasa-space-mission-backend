
import { EpisodeModel } from "./models/episodeModel";
import { EpisodeVersionModel } from "./models/episodeVersionModel";
import { NarrativeRoleModel } from "./models/narrativeRoleModel";
import { PrefabModel } from "../prefabs/models/prefabModel";
import { AuthModel } from "../auth/models/authModel";

export const registerEpisodesAssociations = () => {
    // Relación Auth (Author) -> Episodes
    AuthModel.hasMany(EpisodeModel, { foreignKey: 'authorId', as: 'createdEpisodes' });
    EpisodeModel.belongsTo(AuthModel, { as: 'author', foreignKey: 'authorId' });
    
    // Relación Episode -> Version
    EpisodeModel.hasMany(EpisodeVersionModel, { foreignKey: 'episodeId', onDelete: 'CASCADE' });
    EpisodeVersionModel.belongsTo(EpisodeModel, { foreignKey: 'episodeId' });

    // Relación Episode -> Narrative Roles
    EpisodeModel.hasMany(NarrativeRoleModel, { foreignKey: 'episodeId', as: 'narrativeRoles', onDelete: 'CASCADE' });
    NarrativeRoleModel.belongsTo(EpisodeModel, { foreignKey: 'episodeId', as: 'episode' });

    // Relación Role -> Character Prefab
    NarrativeRoleModel.belongsTo(PrefabModel, { foreignKey: 'characterPrefabId', as: 'characterPrefab' });
};