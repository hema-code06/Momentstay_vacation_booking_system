const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const BUCKET = process.env.S3_BUCKET_NAME;
const isProduction = process.env.NODE_ENV === "production";

const useS3 =
  process.env.USE_S3 !== "false" &&
  Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && BUCKET);

const uploadsDir = path.join(__dirname, "../public/uploads");
if (!useS3 && !isProduction) fs.mkdirSync(uploadsDir, { recursive: true });

const s3 = useS3
  ? new S3Client({
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  })
  : null;

const fileFilter = (req, file, cb) =>
  file.mimetype?.startsWith("image/")
    ? cb(null, true)
    : cb(new Error("Only image files are allowed!"), false);

const uniqueName = (originalname) =>
  `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(originalname).toLowerCase() || ".jpg"}`;

const storageMissing = () => (req, res, cb) =>
  cb(new Error("Image storage is not configured on the server."));

const uploadToS3 = (folder) => {
  if (!useS3 && isProduction) {
    console.error("S3 is not configured. Image uploads are disabled.");
    return { single: storageMissing, array: storageMissing };
  }

  return multer({
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter,
    storage: useS3
      ? multerS3({
        s3,
        bucket: BUCKET,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        cacheControl: "public, max-age=31536000",
        key: (req, file, cb) => cb(null, `${folder}/${uniqueName(file.originalname)}`),
      })
      : multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadsDir),
        filename: (req, file, cb) => cb(null, uniqueName(file.originalname)),
      }),
  });
};

const deleteS3Photos = async (urls = []) => {
  if (!s3) return;
  const keys = urls
    .filter((u) => typeof u === "string" && u.includes(`${BUCKET}.s3`) && u.includes(".amazonaws.com/"))
    .map((u) => decodeURIComponent(u.split(".amazonaws.com/")[1].split("?")[0]));
  await Promise.allSettled(
    keys.map((Key) => s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key })))
  );
};

module.exports = { uploadToS3, deleteS3Photos };
