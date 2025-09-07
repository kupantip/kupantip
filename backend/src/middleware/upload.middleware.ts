import multer from 'multer';
import path from 'path';
import fs from 'fs';

// สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// เก็บไฟล์ใน uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname).toLowerCase());
  },
});

// รองรับเฉพาะ jpeg/png/gif
const allowedExt = ['.jpg', '.jpeg', '.png', '.gif'];
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExt.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only jpeg, png, gif files are allowed!'), false);
  }
};

// ใช้ memory เก็บ size ของแต่ละไฟล์
let totalSize = 0;

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // กันไฟล์เดียว >10MB ด้วย
}).array('files', 5); // สูงสุด 5 ไฟล์

// Middleware wrapper เช็คขนาดรวมไม่เกิน 10MB
export const uploadWithLimit = (req: any, res: any, next: any) => {
  totalSize = 0;
  upload(req, res, (err: any) => {
    if (err) return res.status(400).json({ message: err.message });

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
