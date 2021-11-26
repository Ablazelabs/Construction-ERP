const express = require("express");
const router = express.Router();
const { verify } = require("jsonwebtoken");
const { genSalt, hash } = require("bcrypt");

const { sequelizer, error, confirmCredential } = require("../../config/config");
const { sequelize, QueryTypes } = sequelizer();

const inputFilter = require("../../validation/inputFilter");
const { userHasPrivilegeOver } = require("../../validation/auth");
const validation = require("../../validation/validation");
router.post("/account/changepassword", async (req, res, next) => {
  try {
    inputFilter(
      { newPassword: "string" },
      { accessToken: "string", tempAccessToken: "string", id: "number" },
      req.body
    );
  } catch (e) {
    error(e.key, e.message, next, 400);
    return;
  }
  if (!req.body.accessToken && !req.body.tempAccessToken) {
    error("access", "temp or full access token must be provided", next);
    return;
  }
  if (!validation.checkPassword(req.body.newPassword, next)) {
    return;
  }
  let payLoad;
  try {
    payLoad = verify(
      req.body.tempAccessToken || req.body.accessToken,
      process.env.ACCESS_KEY
    );
  } catch (e) {
    console.log("where 1");
    console.log(e);
    error(
      req.body.tempAccessToken ? "tempAccessToken" : "accessToken",
      "Invalid or Expired Access Token",
      next,
      401
    );
    console.log("where 2");
    return;
  }
  let id;
  if (req.body.tempAccessToken) {
    id = payLoad.tempId;
  } else {
    if (!req.body.id && req.body.id != 0) {
      error("id", "must be given with access token", next);
      return;
    }
    const PRIVILEGE_TYPE = "user_update";
    id = req.body.id;
    if (
      !(await userHasPrivilegeOver(
        payLoad.id,
        req.body.id,
        PRIVILEGE_TYPE,
        next
      ))
    ) {
      return;
    }
  }

  try {
    await sequelize.authenticate();
    const salt = await genSalt(10);
    const hashPassword = await hash(req.body.newPassword, salt);
    await sequelize.query(
      `UPDATE account SET password = :password WHERE id=:value`,
      {
        replacements: { password: hashPassword, value: id },
        type: QueryTypes.UPDATE,
      }
    );
    res.send({ success: true });
  } catch (e) {
    console.log(e);
    error("database", "error", next, 500);
  }
});
module.exports = router;
