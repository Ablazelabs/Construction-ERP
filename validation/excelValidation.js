const { error } = require("../config/config");
const xlsx = require("node-xlsx");
const fs = require("fs");
const finishUp = async (filePath) => {
  // await fs.rm(filePath);
  await fs.unlink(filePath, () => {});
  // fs.rmSync(filePath);
};
module.exports = async (reqFile, next) => {
  if (reqFile) {
    const filePath = reqFile.path;
    const fileSize = reqFile.size;
    const fileType = reqFile.originalname.split(".").reverse()[0];
    if (fileType == "xlsx" || fileType == "xls") {
      if (fileSize < 5000000) {
        var obj = xlsx.parse(filePath);
        finishUp(filePath);
        return obj[0];
        //todo tomorrow
        /**
         * excel validation validates based on given type, returns false upon throwing an error
         * returns savelist kind of data, savelist implemented on services and saves list based on type of file
         * ok i don't know how to validate data without it being in service layer. OK thanks( may be do what u did here into save data thanks; :)
         */
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
