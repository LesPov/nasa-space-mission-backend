export interface PlayerStateInterface {
    id: number;
    userId: number; // El jugador
    episodeId: number; // El episodio que está jugando
    slot: number; // Para tener múltiples partidas guardadas (slot 1, 2, 3)
    
    lastPosition: { x: number, y: number, z: number };
    
    // El estado de los objetos/triggers del mundo para esta partida
    worldState: object; // JSON, ej: { 'puerta_principal': 'abierta', 'llave_recogida': true }
    
    inventory: number[]; // Un array con los IDs de los assets que el jugador tiene
}