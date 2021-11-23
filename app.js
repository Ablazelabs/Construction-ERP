const express = require("express");
const { json } = require("body-parser");

const app = express();

const account = require("./api-routes/account");

app.use(json());

app.use(account);
const port = 3000;

module.exports = app.listen(port, () => {
  console.log("App listening on port 3000!");
});
