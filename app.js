const express = require("express");
const { json } = require("body-parser");

require("dotenv").config();

const app = express();

const account = require("./api-routes/account");
const login = require("./api-routes/account/login");

app.use(json());

app.use(account);
app.use(login);

const port = 3000;

module.exports = app.listen(port, () => {
  console.log("App listening on port 3000!");
});
