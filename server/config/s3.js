const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");
const multer = require("multer");

const s3Config = {
  region: process.env.AWS_REGION || "us-east-1",
};

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3Config.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}

const s3 = new S3Client(s3Config);

const uploadToS3 = (folder) =>
  multer({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max file size
    fileFilter: (req, file, cb) => {
      if (file.mimetype && file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed!"), false);
      }
    },
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

module.exports = { s3, uploadToS3 };
