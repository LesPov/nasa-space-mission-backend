import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const uploadDir = path.resolve(process.cwd(), 'uploads/thumbnails');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'thumb-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const imageFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo de imagen no soportado.'));
    }
};

export const uploadThumbnail = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB para miniaturas es suficiente
    fileFilter: imageFileFilter
});

// Middleware simple que simula el antiguo proceso pero sin sharp
export const processAndSaveImage = async (req: Request, res: any, next: any) => {
    if (!req.file) return next();
    
    // Asignamos el nombre para que el controlador lo entienda
    (req.file as any).originalFilename = req.file.filename;
    (req.file as any).previewFilename = req.file.filename;
    
    next();
};