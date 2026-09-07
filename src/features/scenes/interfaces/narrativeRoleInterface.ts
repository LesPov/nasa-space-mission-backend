export interface NarrativeRoleInterface {
    id: number;
    episodeId: number;
    uid: string;
    name: string;
    description: string;
    isEnabled: boolean;
    isPlayable: boolean;
    sortOrder: number;
    targetSceneObjectUid: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}