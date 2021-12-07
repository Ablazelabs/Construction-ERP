const express = require("express");
const { json } = require("body-parser");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
require("dotenv").config();

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
const restMasterData = require("./api-routes/restMasterData");
const operational_data = require("./api-routes/operational_data");
app.use(json());

app.use(account);
app.use(login);
app.use(forgotpassword);
app.use(sendcode);
app.use(changepassword);
app.use(role);
app.use(privilege);
app.use(upload);
app.use(client);
app.use(material);
app.use(restMasterData);
app.use(operational_data);

app.use((err, _req, res, _next) => {
    let myError = JSON.parse(err.message);
    const status = myError.status;
    myError.status = undefined;
    res.status(status).send({ error: myError });
});
const port = 3000;

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "LogRocket Express API with Swagger",
            version: "0.1.0",
            description:
                "This is the ERP system made with Express and documented with Swagger",
            contact: {
                name: "Ablaze Labs",
                url: "https://ablazelabs.com",
                email: "info@email.com",
            },
        },
        servers: [
            {
                url: "http://localhost:3000",
            },
        ],
    },
    apis: [
        // "./api-routes/account.js",
        "./api-routes/privilege.js",
        "./api-routes/role.js",
        "./api-routes/restMasterData.js",
        "./api-routes/material.js",
        "./api-routes/client.js",
        "./api-routes/account/login.js",
        "./api-routes/account/sendcode.js",
        "./api-routes/account/changepassword.js",
        "./api-routes/account/forgotpassword.js",
        "./api-routes/account/operational_data.js",
        "./documentation/account.yaml",
    ],
};

const specs = swaggerJsdoc(options);

app.use(
    "/api-docs",
    swaggerUi.serve,
    // swaggerUi.setup(specs, { explorer: true })
    swaggerUi.setup(YAML.load("./documentation/api.yaml"), { explorer: true })
);
module.exports = app.listen(port, () => {
    console.log("App listening on port 3000!");
});
