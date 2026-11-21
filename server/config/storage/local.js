const fs = require("fs");
const path = require("path");

const uploadsDir = path.join(__dirname, "../../public/uploads");

module.exports = {
    configured: true,

    owns: (url) => url.startsWith("/uploads/"),

    async upload(file, key) {
        const name = path.basename(key);
        await fs.promises.mkdir(uploadsDir, { recursive: true });
        await fs.promises.writeFile(path.join(uploadsDir, name), file.buffer);
        return `/uploads/${name}`;
    },

    async remove(url) {
        await fs.promises.unlink(path.join(uploadsDir, path.basename(url))).catch(() => { });
    },
};
