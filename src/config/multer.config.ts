import multer, { StorageEngine, FileFilterCallback } from "multer";
import { Request } from "express";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(path.resolve(), "../../public/uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
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
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, JPG, PNG, and GIF files are allowed!"));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter
});
