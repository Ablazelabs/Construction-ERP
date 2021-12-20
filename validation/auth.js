//this module performs authorization for users
const { verify } = require("jsonwebtoken");
const { error } = require("../config/config");

const authorization = {
    userHasPrivilege: async (userId, previlage, next) => {
        return true;
        //calls error if user isn't authenticated
    },
    userHasPrivilegeOver: async (userId, secondUserId, previlage, next) => {
        return true;
    },
    authenticate: async (req, res, next) => {
        const requestRoute = req.path.split("/").pop();
        const pass =
            req.path.search(/\/api-docs\/|\/uploads\//) == -1 ? false : true;
        const method = req.method;
        if (
            requestRoute == "login" ||
            requestRoute == "forgotpassword" ||
            requestRoute == "refresh" ||
            requestRoute == "sendcode" ||
            pass
        ) {
            next();
            return;
        }
        if (requestRoute == "account" && method == "POST") {
            next();
            return;
        }
        if (!req.headers.authorization) {
            error("accessToken", "was not sent", next, 401);
            return;
        }
        const accessToken = req.headers.authorization.split(" ")[1];
        let payLoad;
        try {
            payLoad = verify(accessToken, process.env.ACCESS_KEY);
        } catch (e) {
            error("accessToken", "Invalid or Expired Access Token", next, 401);
            return;
        }
        if (requestRoute == "changepassword") {
            if (payLoad.id) {
                res.locals.id = payLoad.id;
            } else {
                res.locals.tempId = payLoad.tempId;
            }
            next();
            return;
        } else {
            try {
                res.locals.id = payLoad.id;
            } catch (e) {}
        }
        const PRIVILEGE_TYPE = `${requestRoute}_${method}`;
        if (
            requestRoute == "account" &&
            (method == "PATCH" || method == "DELETE")
        ) {
            if (
                !(await authorization.userHasPrivilegeOver(
                    payLoad.id,
                    req.body.id,
                    PRIVILEGE_TYPE,
                    next
                ))
            ) {
                return;
            }
        } else {
            if (
                !(await authorization.userHasPrivilege(
                    payLoad.id,
                    PRIVILEGE_TYPE,
                    next
                ))
            )
                return;
        }
        next();
    },
};

module.exports = authorization;
