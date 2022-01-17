const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const inputFilter = require("../../../validation/inputFilter");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const excelValidation = require("../../../validation/excelValidation");
const saveList = require("../../../services/employeePayscaleSaveList");
router.post(
    "/employee_pay_scale/upload",
    upload.single("file"),
    async (req, res, next) => {
        try {
            const data = await excelValidation(req.file, next);
            if (data == false) {
                return;
            }
            const saved = await saveList(
                data.data,
                req.body.type,
                res.locals.id,
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
