
import { NarrativeRoleModel } from '../models/narrativeRoleModel';
import { PrefabModel } from '../../prefabs/models/prefabModel';
import { NarrativeRoleDto } from '../../../shared/contracts';

class NarrativeRoleLogicService {
    public async getRolesByEpisode(episodeId: number) {
        const roles = await NarrativeRoleModel.findAll({
            where: { episodeId },
            include: [{ model: PrefabModel, as: 'characterPrefab' }],
            order: [['sortOrder', 'ASC']]
        });
        return roles.map(r => r.toJSON());
    }

    public async createRole(episodeId: number, data: NarrativeRoleDto) {
        const role = await NarrativeRoleModel.create({
            ...data,
            episodeId
        });
        return this.getRoleById(role.getDataValue('id'));
    }

    public async updateRole(roleId: number, data: Partial<NarrativeRoleDto>) {
        await NarrativeRoleModel.update(data, { where: { id: roleId } });
        return this.getRoleById(roleId);
    }

    public async deleteRole(roleId: number) {
        await NarrativeRoleModel.destroy({ where: { id: roleId } });
        return true;
    }

    public async getRoleById(roleId: number) {
        const role = await NarrativeRoleModel.findByPk(roleId, {
            include: [{ model: PrefabModel, as: 'characterPrefab' }]
        });
        return role ? role.toJSON() : null;
    }
}
export default new NarrativeRoleLogicService();