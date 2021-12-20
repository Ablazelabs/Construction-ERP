const express = require("express");
const { json } = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");
require("dotenv").config();
const { authenticate } = require("./validation/auth");
const app = express();

const account = require("./api-routes/account");
const login = require("./api-routes/account/login");
const refresh = require("./api-routes/account/refresh");
const forgotpassword = require("./api-routes/account/forgotpassword");
const sendcode = require("./api-routes/account/sendcode");
const changepassword = require("./api-routes/account/changepassword");
const role = require("./api-routes/role");
const privilege = require("./api-routes/privilege");
const upload = require("./api-routes/project/master/upload");
const client = require("./api-routes/project/master/client");
const material = require("./api-routes/project/master/material");
const documentation = require("./api-routes/project/master/documentation");
const restMasterData = require("./api-routes/project/master/restMasterData");
const operationalData = require("./api-routes/project/operational/operational_data");
const financemasters = require("./api-routes/finance/master/financemasters");
const accountingPeriod = require("./api-routes/finance/master/accountingPeriod");
const restFinanceOperational = require("./api-routes/finance/operational/rest_finance_operational");
const financeUpload = require("./api-routes/finance/operational/upload");
const hcmMasters = require("./api-routes/hcm/master/hcmMasters");
const hcmEmployeeMasters = require("./api-routes/hcm/employee_master/hcmEmployeeMasters");
const fileEmployeeMasters = require("./api-routes/hcm/employee_master/fileEmployeeMasters");
const cors = require("cors");

app.use(json());
app.use(cors());
app.use(authenticate);

app.use((req, _res, next) => {
    // this code is a hack
    // we used req.body to get data from requests, but get doesn't allow, so stringify the json u want to send and send it as a param (parameter name must be body)
    if (req.method == "GET") {
        if (Object.keys(req.body).length == 0) {
            if (req.query.body) {
                try {
                    req.body = JSON.parse(req.query.body);
                } catch {}
            }
        }
    }
    next();
});

app.use(login);
app.use(refresh);

app.use(account);
app.use(forgotpassword);
app.use(sendcode);
app.use(changepassword);
app.use(role);
app.use(privilege);

app.use("/project/master", upload);
app.use("/project/master", client);
app.use("/project/master", material);
app.use("/project/master", documentation);
app.use("/project/master", restMasterData);
app.use("/project/operational", operationalData);
app.use("/finance/master", financemasters);
app.use("/finance/master", accountingPeriod);
app.use("/finance/operational", restFinanceOperational);
app.use("/finance/operational", financeUpload);
app.use("/hcm/master", hcmMasters);
app.use("/hcm/employee_master/", hcmEmployeeMasters);
app.use("/hcm/employee_master/", fileEmployeeMasters);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use((err, _req, res, _next) => {
    let myError = JSON.parse(err.message);
    const status = myError.status;
    myError.status = undefined;
    res.status(status).send({ error: myError });
});
const port = 3000;

const basicAuth = require("express-basic-auth");

app.use(
    "/api-docs",
    basicAuth({
        users: { yourUser: "yourPassword" },
        challenge: true,
    }),
    swaggerUi.serve,
    swaggerUi.setup(require("./documentation/allApis"), { explorer: true })
);

module.exports = app.listen(port, () => {
    console.log(`App listening on port ${port}!`);
});
