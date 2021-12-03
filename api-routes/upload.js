const express = require("express");
const router = express.Router();
const { error } = require("../config/config");
const { verify } = require("jsonwebtoken");
const inputFilter = require("../validation/inputFilter");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const excelValidation = require("../validation/excelValidation");
const saveList = require("../services/saveList");
router.post("/upload", upload.single("file"), async (req, res, next) => {
  try {
    inputFilter(
      {
        accessToken: "string",
      },
      {},
      req.body
    );
    req.body.type = Number(req.body.type);
    if (!req.body.type && req.body.type != 0) {
      throw { key: "type", message: "please send a number" };
    }
    if (Number(req.body.type) < 0 && Number(req.body.type) > 9) {
      throw { key: "type", message: "please send between 0 and 9" };
    }
  } catch (e) {
    error(e.key, e.message, next);
    return;
  }
  let payLoad;
  try {
    payLoad = verify(req.body.accessToken, process.env.ACCESS_KEY);
  } catch (e) {
    error("accessToken", "Invalid or Expired Access Token", next, 401);
    return;
  }
  try {
    const data = await excelValidation(req.file, next);
    if (data == false) {
      return;
    }
    const saved = await saveList(data.data, req.body.type, payLoad.id, next);
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
module.exports = router;
