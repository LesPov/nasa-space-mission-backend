import { Model } from 'sequelize';
import { AuthInterface } from '../../auth/interfaces/authInterface';
 
// Modelo para el perfil de usuario
export interface UserProfileinterface extends Model {
  id: number;
  userId: number;
  profilePicture: string | null;
  firstName: string;
  lastName: string;
  identificationType: 'Cédula' | 'Tarjeta de Identidad' | 'DNI' | 'Pasaporte' | 'Licencia de Conducir' | 'Otro';
  identificationNumber: string;
  biography: string | null;
  direccion: string | null;
  birthDate: string; // Formato YYYY-MM-DD
  gender: 'Mujer' | 'Hombre' | 'Otro género' | 'Prefiero no declarar';
  status: 'Activado' | 'Desactivado'
  campiamigo: boolean;
  zoneId: number | null; // Relación opcional con el modelo de zona
  auth?: AuthInterface; // Relación opcional con el modelo de autenticación
}