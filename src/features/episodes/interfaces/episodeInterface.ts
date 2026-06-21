import { SceneObjectInterface } from "./sceneObjectInterface";
import { TriggerInterface } from "./triggerInterface";

// Definimos los tipos de análisis posibles. Esto es extensible para el futuro.
export type AnalysisType = 
    | 'DEEP_SPACE_ASTROPHOTOGRAPHY' // Para el script de galaxias que ya tienes
    | 'PLANETARY_BODY'              // Futuro script para analizar planetas
    | 'NEBULA';                     // Futuro script para analizar nebulosas

export interface EpisodeInterface {
    id: number;
    title: string;
    description?: string;
    thumbnailUrl: string;
    isPublished: boolean;
    authorId: number;
    analysisState: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    analysisType: string;
    
    worldSettings?: any; 
    uiSettings?: any; // 🔥 NUEVO: Configuración visual del Modal y Objetivos
    
    triggers?: any[]; 
    createdAt?: Date;
    updatedAt?: Date;
}
// Interfaz para la respuesta paginada al obtener un episodio completo
export interface PaginatedEpisodeResponse {
    episode: EpisodeInterface;
    sceneObjects: SceneObjectInterface[];
    pagination: {
        totalObjects: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    };
}