const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const inputFilter = require("../../../validation/inputFilter");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const excelValidation = require("../../../validation/excelValidation");
const saveList = require("../../../services/saveList");
const projectMasterTemplates = require("../../../services/projectMasterTemplates");
router.post("/upload", upload.single("file"), async (req, res, next) => {
    try {
        inputFilter({}, {}, req.body);
        req.body.type = Number(req.body.type);
        if (!req.body.type && req.body.type != 0) {
            throw { key: "type", message: "please send a number" };
        }
        if (Number(req.body.type) < 0 && Number(req.body.type) > 11) {
            throw { key: "type", message: "please send between 0 and 11" };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
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
});
router.get("/download", async (req, res, next) => {
    const type = Number(req.body.type);
    if (isNaN(type)) {
        return error("type", "please send number", next);
    }
    if (type < 0 || type > 12) {
        return error("type", "please send number between 0 and 12", next);
    }
    return res.json({ file: projectMasterTemplates(type) });
});
module.exports = router;
