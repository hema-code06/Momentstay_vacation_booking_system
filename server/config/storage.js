const multer = require("multer");
const path = require("path");

const PROVIDERS = ["s3", "cloudinary", "local"];
const isProduction = process.env.NODE_ENV === "production";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const loaded = {};

const getProvider = (name) => {
    if (!(name in loaded)) {
        try {
            const provider = require(`./storage/${name}`);
            loaded[name] = provider.configured ? provider : null;
        } catch (err) {
            console.error(`Storage provider "${name}" could not be loaded: ${err.message}`);
            loaded[name] = null;
        }
    }
    return loaded[name];
};

const chooseProvider = () => {
    const requested = (process.env.STORAGE_PROVIDER || "").toLowerCase();
    if (requested) return requested;
    if (process.env.USE_S3 !== "false" && process.env.AWS_ACCESS_KEY_ID && process.env.S3_BUCKET_NAME) {
        return "s3";
    }
    return isProduction ? "" : "local";
};

const activeName = chooseProvider();
const active =
    PROVIDERS.includes(activeName) && !(activeName === "local" && isProduction)
        ? getProvider(activeName)
        : null;

if (active) console.log(`Image storage: ${activeName}`);
else console.error("No image storage is configured. Image uploads are disabled.");

const parser = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) =>
        file.mimetype?.startsWith("image/")
            ? cb(null, true)
            : cb(new Error("Only image files are allowed!"), false),
});

const uniqueName = (originalname) =>
    `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(originalname).toLowerCase() || ".jpg"}`;

const deleteImages = async (urls = []) => {
    const tasks = urls
        .filter((url) => typeof url === "string")
        .map((url) => {
            const provider = PROVIDERS.map(getProvider).find((p) => p && p.owns(url));
            return provider && provider.remove(url);
        })
        .filter(Boolean);
    await Promise.allSettled(tasks);
};

const saveFiles = async (folder, files) => {
    const results = await Promise.allSettled(
        files.map((file) => active.upload(file, `${folder}/${uniqueName(file.originalname)}`))
    );
    const urls = results.filter((r) => r.status === "fulfilled").map((r) => r.value);
    const failed = results.find((r) => r.status === "rejected");

    if (failed) {
        await deleteImages(urls);
        throw failed.reason;
    }
    files.forEach((file, index) => {
        file.location = urls[index];
        delete file.buffer;
    });
};

const handleUpload = (parse, folder) => (req, res, next) =>
    parse(req, res, async (err) => {
        if (err) return next(err);

        const files = req.file ? [req.file] : req.files || [];
        if (files.length === 0) return next();
        if (!active) return next(new Error("Image storage is not configured on the server."));

        try {
            await saveFiles(folder, files);
            next();
        } catch (uploadError) {
            console.error("Image upload failed:", uploadError);
            next(new Error(`Image upload failed: ${uploadError.message || "unknown error"}`));
        }
    });

const uploadImages = (folder) => ({
    single: (field) => handleUpload(parser.single(field), folder),
    array: (field, max) => handleUpload(parser.array(field, max), folder),
});

module.exports = { uploadImages, deleteImages };
