const { error } = require("../config/config");
module.exports = (
    reqFile,
    allowedFileTypes,
    next,
    required = false,
    maxFileSize = 5000000
) => {
    if (reqFile) {
        const fileSize = reqFile.size;
        const fileType = reqFile.originalname.split(".").reverse()[0];
        if (allowedFileTypes.indexOf(fileType) != -1) {
            if (fileSize < maxFileSize) {
                return true;
            } else {
                error("file", "file is too large", next);
                throw "error";
            }
        } else {
            error(
                "file",
                `file must be one of ${allowedFileTypes} format`,
                next
            );
            throw "error";
        }
    } else {
        if (required) {
            error("file", "no file has been sent for update", next);
            throw "error";
        } else {
            return false;
        }
    }
};
