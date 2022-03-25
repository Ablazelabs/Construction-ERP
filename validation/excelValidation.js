const { error } = require("../config/config");
const xlsx = require("node-xlsx");
const fs = require("fs");
const finishUp = (filePath) => {
    // await fs.rm(filePath);
    fs.unlink(filePath, () => {});
    // fs.rmSync(filePath);
};
module.exports = async (reqFile, next, shouldDelete = true) => {
    if (reqFile) {
        const filePath = reqFile.path;
        const fileSize = reqFile.size;
        const fileType = reqFile.originalname.split(".").reverse()[0];
        if (fileType == "xlsx" || fileType == "xls") {
            if (fileSize < 5000000) {
                var obj = xlsx.parse(filePath);
                if (shouldDelete) finishUp(filePath);
                return obj[0];
            } else {
                await finishUp(filePath);
                error("file", "file is too large", next);
                return false;
            }
        } else {
            await finishUp(filePath);
            error("file", "file must be xls or xlsx format", next);
            return false;
        }
    } else {
        error("file", "no file has been sent for update", next);
        return false;
    }
};
