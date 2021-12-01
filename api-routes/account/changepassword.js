/**
 * @swagger
 * path:
 * /account/changepassword:
 *  post:
 *    summary: changes password((temptoken,id),(password,accesstoken),(accesstoken, id))
 *    tags: [Accounts]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              newPassword:
 *                type: string
 *                required: true
 *              accessToken:
 *                type: string
 *              tempAccessToken:
 *                type: string
 *              id:
 *                type: integer
 *              password:
 *                type: string
 *    responses:
 *      200:
 *        description: success message
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 */
const express = require("express");
const router = express.Router();
const { verify } = require("jsonwebtoken");

const { error } = require("../../config/config");

const changepassword = require("../../services/changepassword");
const inputFilter = require("../../validation/inputFilter");
const { userHasPrivilegeOver } = require("../../validation/auth");
const validation = require("../../validation/validation");
router.post("/account/changepassword", async (req, res, next) => {
  try {
    inputFilter(
      { newPassword: "string" },
      {
        accessToken: "string",
        tempAccessToken: "string",
        id: "number",
        password: "string",
      },
      req.body
    );
  } catch (e) {
    error(e.key, e.message, next);
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
    error(
      req.body.tempAccessToken ? "tempAccessToken" : "accessToken",
      "Invalid or Expired Access Token",
      next,
      401
    );
    return;
  }
  let id;
  let selfUpdate = false;
  if (req.body.tempAccessToken) {
    id = payLoad.tempId;
  } else {
    if (!req.body.id && req.body.id != 0) {
      if (req.body.password) {
        selfUpdate = true;
        id = payLoad.id;
      } else {
        error("id", "must be given with access token", next);
        return;
      }
    } else {
      id = req.body.id;
    }
    const PRIVILEGE_TYPE = "user_update";
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
    const data = await changepassword(selfUpdate, id, req.body, next);
    if (data == false) {
      return;
    }
    res.json(data);
  } catch (e) {
    console.log(e);
    error("database", "error", next, 500);
  }
});
module.exports = router;
