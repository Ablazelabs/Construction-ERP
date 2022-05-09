const { error } = require("../config/config");
const xlsx = require("node-xlsx");
const fs = require("fs");
const finishUp = (filePath) => {
    // await fs.rm(filePath);
    fs.unlink(filePath, () => {});
    // fs.rmSync(filePath);
};
/**
 * It takes a file, checks if it's an excel file, if it is, it parses it and returns the parsed object,
 * if it's not, it returns false.
 * @param reqFile - the file that was sent to the server
 * @param next - is the next function in the middleware chain
 * @param [shouldDelete=true] - if you want to delete the file after you're done with it.
 * @returns the object that is created by the xlsx.parse() function.
 */
const excelValidation = async (reqFile, next, shouldDelete = true) => {
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
module.exports = excelValidation;
