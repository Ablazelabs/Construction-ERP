const express = require("express");
const router = express.Router();

const { error } = require("../../config/config");

const inputFilter = require("../../validation/inputFilter");
const forgotpassword = require("../../services/forgotpassword");
router.post("/account/forgotpassword", async (req, res, next) => {
  try {
    inputFilter({}, { phone_number: "string", email: "string" }, req.body);
  } catch (e) {
    error(e.key, e.message, next, 400);
    return;
  }
  if (!req.body.phone_number && !req.body.email) {
    error("identifier", "email or phone must be provided", next);
    return;
  }
  const identifier = req.body.phone_number
    ? { key: "phone_number", value: req.body.phone_number }
    : { key: "email", value: req.body.email };
  let code = 123434;
  //todo... use the below code instead and send the code really to the email
  //const code = Math.floor(Math.random()*1000000)
  if (code < 100000) {
    code += 100000;
  }

  try {
    let identifier2 = {};
    identifier2[identifier.key] = identifier["value"];
    res.json(await forgotpassword(identifier2, identifier.value, code));
  } catch (e) {
    error("database", "error", next, 500);
  }
});

module.exports = router;
