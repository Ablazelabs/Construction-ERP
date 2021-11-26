const express = require("express");
const { json } = require("body-parser");

require("dotenv").config();

const app = express();

const account = require("./api-routes/account");
const login = require("./api-routes/account/login");
const forgotpassword = require("./api-routes/account/forgotpassword");
const sendcode = require("./api-routes/account/sendcode");
const changepassword = require("./api-routes/account/changepassword");

app.use(json());

app.use(account);
app.use(login);
app.use(forgotpassword);
app.use(sendcode);
app.use(changepassword);
app.use((err, _req, res, _next) => {
  let myError = JSON.parse(err.message);
  const status = myError.status;
  myError.status = undefined;
  res.status(status).send({ error: myError });
});
const port = 3000;

module.exports = app.listen(port, () => {
  console.log("App listening on port 3000!");
});
