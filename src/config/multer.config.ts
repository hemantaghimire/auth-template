import multer, { StorageEngine, FileFilterCallback } from "multer";
import { Request } from "express";
import fs from "fs";
import path from "path";
import getLogger from "./logger.config";

const logger = getLogger("multer.config");
const UPLOAD_DIR = path.join(__dirname, "../../public/uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extension = path.extname(file.originalname).toLowerCase();
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && allowedTypes.test(extension)) {
    logger.info(`Accepting file: ${file.originalname}`);
    cb(null, true);
  } else {
    logger.error(`Rejected file: ${file.originalname} (invalid type)`);
    cb(new Error("Only JPEG, JPG, PNG, and GIF files are allowed!"));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter
});
