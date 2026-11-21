const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

const configured = Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);

const create = () => {
    const cloudinary = require("cloudinary").v2;

    cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
        secure: true,
    });

    return {
        configured,

        owns: (url) => url.includes("res.cloudinary.com"),

        upload: (file, key) =>
            new Promise((resolve, reject) => {
                cloudinary.uploader
                    .upload_stream(
                        { public_id: key.replace(/\.[^./]+$/, ""), resource_type: "image" },
                        (err, result) => (err ? reject(err) : resolve(result.secure_url))
                    )
                    .end(file.buffer);
            }),

        async remove(url) {
            const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i);
            if (match) await cloudinary.uploader.destroy(decodeURIComponent(match[1]));
        },
    };
};

module.exports = configured ? create() : { configured: false };
