import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Directorio para los assets globales del juego (modelos, sonidos, etc.)
const uploadDir = path.resolve(process.cwd(), 'uploads/assets');

// 🔥 FIX ERROR 500: Aseguramos la creación de la carpeta sin crashear el servidor
try {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
} catch (err) {
    console.error("❌ Error creando el directorio de uploads:", err);
}

// Configuración de almacenamiento para mantener nombres únicos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const basename = path.basename(file.originalname, extension).toLowerCase().replace(/[^a-z0-9]/g, '-');
        cb(null, `${basename}-${uniqueSuffix}${extension}`);
    }
});

// Filtro para aceptar solo los tipos de archivo permitidos para assets
const assetFileFilter = (req: any, file: Express.Multer.File, cb: any) => {
    const ext = path.extname(file.originalname).toLowerCase();
    
    const allowedExtensions = [
        '.glb', 
        '.obj', 
        '.mp4', 
        '.png', 
        '.jpg', 
        '.jpeg', 
        '.mp3'
    ];

    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`Tipo de archivo no permitido. Solo se aceptan: ${allowedExtensions.join(', ')}`), false);
    }
};

export const uploadAsset = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 🔥 FIX: Aumentado a 100MB para Modelos GLB pesados
    fileFilter: assetFileFilter
});