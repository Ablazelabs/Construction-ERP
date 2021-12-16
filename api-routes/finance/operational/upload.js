const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");

const { rename } = require("fs");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const excelValidation = require("../../../validation/excelValidation");
const saveList = require("../../../services/finance_operational_savelist");
router.post(
    ["/chart_of_account_files", "/general_journal_files"],
    upload.single("file"),
    async (req, res, next) => {
        const uploadTarget = req.path.split("/").pop();
        try {
            const data = await excelValidation(req.file, next, false);
            if (data == false) {
                return;
            }
            const fileType = req.file.originalname.split(".").pop();
            const filePath = req.file.path + "." + fileType;
            const fileName = req.file.filename;
            const fileUrl = `/public/${fileName}.${fileType}`;
            rename(req.file.path, filePath, () => {});
            const saved = await saveList(
                data.data,
                uploadTarget,
                res.locals.id,
                fileType,
                fileName,
                fileUrl,
                next
            );
            if (saved == false) {
                return;
            } else {
                res.json({
                    success: true,
                    message: "all rows have been created successfully",
                });
            }
        } catch (e) {
            console.log(e);
            error("database", "error", next, 500);
            return;
        }
    }
);
module.exports = router;
