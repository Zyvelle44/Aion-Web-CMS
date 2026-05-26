const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../../../frontend/uploads/settings");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, safeName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ["image/png", "image/jpeg", "image/webp", "image/gif"];

    if (!allowed.includes(file.mimetype)) {
        return cb(new Error("Only image files are allowed."), false);
    }

    cb(null, true);
};

const uploadImage = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 3 * 1024 * 1024
    }
});

module.exports = {
    uploadImage
};