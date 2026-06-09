  // ---
  
  // src/@types/express/index.d.ts (Archivo de definición de tipos globales para Express)
  // Asegúrate de que tsconfig.json incluya este directorio en "typeRoots" o "include"
  
  import { UserRole } from '../../common/enums'; // Ajusta la ruta según tu estructura
  
  /**
   * Extiende la interfaz Request de Express para añadir la propiedad 'user'
   * que contendrá la información del usuario autenticado (proveniente del JWT).
   */
  declare global {
    namespace Express {
      interface Request {
        /**
         * Información del usuario autenticado adjuntada por el middleware validateToken.
         * Es `null` si no hay token o el token no es válido y la ruta permite acceso anónimo.
         * Contiene el ID y el rol del usuario si el token es válido.
         */
        user?: {
          id: number; // Usaremos 'id' consistentemente
          rol: UserRole;
        } | null;
      }
    }
  }
  
  // Este export vacío es necesario para que TypeScript trate el archivo como un módulo
  export {};