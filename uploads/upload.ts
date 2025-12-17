import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: process.env.UPLOAD_DIR || "uploads",
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (_req: any, file: any, cb: any) => {
  const allowed = ["image/jpeg", "image/png", "application/pdf"];
  cb(null, allowed.includes(file.mimetype));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE) },
});
