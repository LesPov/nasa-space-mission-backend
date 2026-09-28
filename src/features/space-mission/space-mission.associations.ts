import { MissionProfileModel } from "./models/missionProfileModel";
import { EpisodeModel } from "../episodes/models/episodeModel";

export const registerSpaceMissionAssociations = () => {
    EpisodeModel.hasOne(MissionProfileModel, { foreignKey: 'episodeId', as: 'missionProfile', onDelete: 'CASCADE' });
    MissionProfileModel.belongsTo(EpisodeModel, { foreignKey: 'episodeId', as: 'episode' });
};