const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME, AWS_REGION = "ap-south-1" } =
  process.env;

const configured = Boolean(AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && S3_BUCKET_NAME);

const create = () => {
  const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

  const client = new S3Client({
    region: AWS_REGION,
    credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY },
  });

  return {
    configured,

    owns: (url) => url.includes(`${S3_BUCKET_NAME}.s3`) && url.includes(".amazonaws.com/"),

    async upload(file, key) {
      await client.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          CacheControl: "public, max-age=31536000",
        })
      );
      return `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
    },

    async remove(url) {
      const key = decodeURIComponent(url.split(".amazonaws.com/")[1].split("?")[0]);
      await client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key }));
    },
  };
};

module.exports = configured ? create() : { configured: false };
