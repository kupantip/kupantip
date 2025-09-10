import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

// Create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Store files in uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname).toLowerCase());
  },
});

// Support only jpeg/png/gif
const allowedExt = ['.jpg', '.jpeg', '.png', '.gif'];
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExt.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type. Allowed types: ${allowedExt.join(', ')}`));
  }
};

// Use memory to store size of each file
let totalSize = 0;

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // no size > 10MB
}).array('files', 5); // Maximum 5 files

// Middleware wrapper check total size not exceed 10MB
export const uploadWithLimit = (req: Request, res: Response, next: NextFunction) => {
  totalSize = 0;
  upload(req, res, (err: unknown) => {
    if (err instanceof Error) return res.status(400).json({ message: err.message });

    if (req.files) {
      for (const file of req.files as Express.Multer.File[]) {
        totalSize += file.size;
      }
      if (totalSize > 10 * 1024 * 1024) {
        return res
          .status(400)
          .json({ message: 'Total file size exceeds 10MB limit' });
      }
    }

    next();
  });
};
