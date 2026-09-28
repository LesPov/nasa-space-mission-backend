import { MissionProfileModel } from '../models/missionProfileModel';
import { EpisodeModel } from '../../episodes/models/episodeModel';
import { CreateMissionProfileDto, MissionProfileDto } from '../../../shared/contracts/space-mission.contracts';
import { AppError } from '../../../infrastructure/errors/app.error';

class MissionProfileLogicService {
    public async getProfileByEpisode(episodeId: number): Promise<MissionProfileDto | null> {
        const profile = await MissionProfileModel.findOne({ where: { episodeId } });
        return profile ? profile.toJSON() as MissionProfileDto : null;
    }

    public async createProfile(episodeId: number, data: CreateMissionProfileDto): Promise<MissionProfileDto> {
        const episode = await EpisodeModel.findByPk(episodeId);
        if (!episode) {
            throw new AppError("El episodio especificado no existe.", 404);
        }

        const existing = await MissionProfileModel.findOne({ where: { episodeId } });
        if (existing) {
            throw new AppError("Ya existe un perfil de misión para este episodio.", 400);
        }

        const profile = await MissionProfileModel.create({ ...data, episodeId });
        return profile.toJSON() as MissionProfileDto;
    }

    public async updateProfile(episodeId: number, data: Partial<MissionProfileDto>): Promise<MissionProfileDto> {
        const profile = await MissionProfileModel.findOne({ where: { episodeId } });
        if (!profile) {
            throw new AppError("Perfil de misión no encontrado.", 404);
        }

        await profile.update(data);
        return profile.toJSON() as MissionProfileDto;
    }
}

export default new MissionProfileLogicService();