const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadsDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Only use S3 if explicitly enabled and valid keys exist
const useS3 =
  process.env.USE_S3 === "true" &&
  Boolean(process.env.AWS_ACCESS_KEY_ID) &&
  Boolean(process.env.AWS_SECRET_ACCESS_KEY);

let s3 = null;
if (useS3) {
  s3 = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const uploadToS3 = (folder) => {
  if (useS3 && s3) {
    return multer({
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter,
      storage: multerS3({
        s3,
        bucket: process.env.S3_BUCKET_NAME || "",
        key: function (req, file, cb) {
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = file.originalname.includes(".")
            ? file.originalname.split(".").pop().toLowerCase()
            : "jpg";
          cb(null, `${folder}/${uniqueSuffix}.${ext}`);
        },
      }),
    });
  }

  // Local disk storage fallback (reliable, no AWS IAM dependencies)
  const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname) || ".jpg";
      cb(null, `${uniqueSuffix}${ext}`);
    },
  });

  return multer({
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter,
    storage: diskStorage,
  });
};

module.exports = { s3, uploadToS3 };
