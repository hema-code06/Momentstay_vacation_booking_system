const {S3Client} = require("@aws-sdk/client-s3")
const multerS3 = require("multer-s3");
const multer = require("multer");

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials:{
        accessKeyId:process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const uploadToS3 = (folder) => 
    multer({
        storage: multerS3({
          s3,
          bucket: process.env.S3_BUCKET_NAME,
          key: function (req, file, cb) {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const ext = file.originalname.split(".").pop();
            cb(null, `${folder}/${uniqueSuffix}.${ext}`);
        },
    }),
});

module.exports = {s3, uploadToS3};