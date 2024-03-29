const express = require("express");
const { json } = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const path = require("path");
require("dotenv").config();
const { authenticate } = require("./validation/auth");
const app = express();
const basicAuth = require("express-basic-auth");
const cors = require("cors");
// const rateLimit = require("express-rate-limit");
const allRoutes = require("./api-routes");
var morgan = require("morgan");
// const limiter = rateLimit({
//     windowMs: 1 * 60 * 1000, // 1 minute
//     max: 30, // Limit each IP to 30 requests per `window` (here, per 1 minute)
//     standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//     legacyHeaders: false, // Disable the `X-RateLimit-*` headers
// });
const employeeData = require("./html/employeeData");
const { loggingRoute } = require("./config/config");
app.use(cors());
// app.use(limiter);
app.use(morgan("dev"));
app.use(json());
app.get("/:id/employee-data", employeeData);
app.get("/api/health", (req, res) => {
    console.log("route", req.originalUrl);
    const host = req.protocol + "://" + req.headers.host;
    res.json({
        success: true,
        message: `api running on ${host}`,
        baseUrl: `${host}/api`,
        currentUrl: `${host}${req.originalUrl}`,
    });
});
app.use(authenticate);
/**
 * we need req.body(json format) to get data from requests, but get doesn't allow, so stringify the json u want to send and send it as a param (parameter name must be body)
 * if body={ something: "something" }
 * some_get_route?body=`${JSON.stringify(body)}`
 */
app.use((req, _res, next) => {
    if (req.method == "GET") {
        if (Object.keys(req.body).length == 0) {
            if (req.query.body) {
                try {
                    req.body = JSON.parse(req.query.body);
                } catch {}
            } else {
                let body = req.query;
                for (let i in body) {
                    const num = parseInt(body[i]);
                    if (num) {
                        body[i] = num;
                    }
                }
                req.body = body;
            }
        }
    }
    next();
});

/**all routes are declared here */
app.use("/api", allRoutes);

/**route where all static uploads are served */
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

/**error handling middleware(all errors go through here, when the router handlers call next with an error) */
app.use((err, _req, res, _next) => {
    let myError = JSON.parse(err.message);
    const status = myError.status;
    delete myError.status;
    res.status(status).send({ error: myError });
});

/**api docs route 👍 */
app.use(
    "/api/api-docs",
    basicAuth({
        users: { yourUser: "yourPassword" },
        challenge: true,
    }),
    swaggerUi.serve,
    swaggerUi.setup(require("./documentation/allApis"), { explorer: true })
);

const port = 3000;

module.exports = app.listen(port, () => {
    console.log(`App listening on port ${port}!`);
});
