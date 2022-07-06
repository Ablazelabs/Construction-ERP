const { error } = require("../config/config");
/**
 * It checks if a file has been sent, if it has, it checks if the file is of the allowed file types, if
 * it is, it checks if the file is less than the max file size, if it is, it returns true, if it isn't,
 * it throws an error,
 * @param reqFile - the file that is being sent to the server
 * @param allowedFileTypes - an array of allowed file types
 * @param next - is the next function in the middleware chain
 * @param [required=false] - boolean
 * @param [maxFileSize=5000000] - the maximum file size allowed
 * @returns A function that takes in 4 parameters and returns a boolean.
 */
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
