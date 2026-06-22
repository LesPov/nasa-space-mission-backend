
import { Optional } from 'sequelize';

export enum TriggerCondition {
    ON_ENTER = 'on_enter',
    ON_EXIT = 'on_exit',
    ON_INTERACT = 'on_interact'
}

export enum TriggerAction {
    PLAY_ANIMATION = 'play_animation',
    TOGGLE_VISIBILITY = 'toggle_visibility',
    MOVE_OBJECT = 'move_object',
    SHOW_MESSAGE = 'show_message',
    CHANGE_SCENE = 'change_scene'
}

export interface TriggerInterface {
    id: number;
    episodeId: number;
    uid: string; // ID único para Triggers
    name: string;
    parentId?: string | null; // AHORA GUARDARÁ EL 'uid' DEL PADRE
    position: { x: number; y: number; z: number };
    size: { x: number; y: number; z: number };
    condition: TriggerCondition;
    actionType: TriggerAction;
    targetObjectName: string;
    actionProperties: { [key: string]: any };
    isRepeatable: boolean;
    isEnabled: boolean;
}

export type TriggerCreationAttributes = Optional<TriggerInterface, 'id' | 'uid'>;