import multer from "multer";
import path from "path";
import fs from "fs/promises";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
const MAX_FILE_SIZE =
    Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024;

// ensure upload directory exists
async function ensureUploadDir() {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

ensureUploadDir();

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
        const unique =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
    const allowed = ["image/png", "image/jpeg", "application/pdf"];

    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type"));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
});
