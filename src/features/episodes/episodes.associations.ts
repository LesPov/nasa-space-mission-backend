import { EpisodeModel } from "./models/episodeModel";
import { EpisodeVersionModel } from "./models/episodeVersionModel";
import { AuthModel } from "../auth/models/authModel";

export const registerEpisodesAssociations = () => {
    // Relación Auth (Author) -> Episodes
    AuthModel.hasMany(EpisodeModel, { foreignKey: 'authorId', as: 'createdEpisodes' });
    EpisodeModel.belongsTo(AuthModel, { as: 'author', foreignKey: 'authorId' });
    
    // Relación Episode -> Version
    EpisodeModel.hasMany(EpisodeVersionModel, { foreignKey: 'episodeId', onDelete: 'CASCADE' });
    EpisodeVersionModel.belongsTo(EpisodeModel, { foreignKey: 'episodeId' });
};