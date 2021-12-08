const express = require("express");
const { json } = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
require("dotenv").config();
const { authenticate } = require("./validation/auth");
const app = express();

const account = require("./api-routes/account");
const login = require("./api-routes/account/login");
const forgotpassword = require("./api-routes/account/forgotpassword");
const sendcode = require("./api-routes/account/sendcode");
const changepassword = require("./api-routes/account/changepassword");
const role = require("./api-routes/role");
const privilege = require("./api-routes/privilege");
const upload = require("./api-routes/upload");
const client = require("./api-routes/client");
const material = require("./api-routes/material");
const documentation = require("./api-routes/documentation");
const restMasterData = require("./api-routes/restMasterData");
const operational_data = require("./api-routes/operational_data");

app.use(json());

app.use(authenticate);

app.use(login);

app.use(account);
app.use(forgotpassword);
app.use(sendcode);
app.use(changepassword);
app.use(role);
app.use(privilege);
app.use(upload);
app.use(client);
app.use(material);
app.use(documentation);
app.use(restMasterData);
app.use(operational_data);
// app.use("/project/master", upload);
// app.use("/project/master", client);
// app.use("/project/master", material);
// app.use("/project/master", documentation);
// app.use("/project/master", restMasterData);
// app.use("/project/operational", operational_data);

app.use((err, _req, res, _next) => {
    let myError = JSON.parse(err.message);
    const status = myError.status;
    myError.status = undefined;
    res.status(status).send({ error: myError });
});
const port = 3000;

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(YAML.load("./documentation/api.yaml"), { explorer: true })
);

module.exports = app.listen(port, () => {
    console.log("App listening on port 3000!");
});
