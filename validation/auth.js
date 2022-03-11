//this module performs authorization for users
const { verify } = require("jsonwebtoken");
const { error, allModels } = require("../config/config");
const { user } = allModels;
const authorization = {
    userHasPrivilege: async (userId, privilege, next) => {
        const myUser = await user.findFirst({
            where: {
                id: userId,
                deleted_status: 0,
                role: {
                    privileges: {
                        some: {
                            OR: [
                                { action: privilege },
                                { action: "admin" },
                                { action: "super" },
                            ],
                        },
                    },
                },
            },
        });
        if (!myUser) {
            error("id", "user doesn't have privilege", next, 403);
            return false;
        }
        return true;
        //calls error if user isn't authenticated
    },
    userHasPrivilegeOver: async (userId, secondUserId, previlage, next) => {
        if (userId == secondUserId) {
            return true;
        }
        const myUser = await user.findFirst({
            where: {
                id: userId,
                deleted_status: 0,
                role: {
                    privileges: {
                        some: {
                            OR: [{ action: "admin" }, { action: "super" }],
                        },
                    },
                },
            },
            select: {
                role: {
                    select: {
                        privileges: {
                            select: { action: true },
                        },
                    },
                },
            },
        });
        if (!myUser) {
            error("id", "user doesn't have privilege", next, 403);
            return false;
        }
        if (myUser.role.privileges.find(({ action }) => action === "super")) {
            return true;
        } else {
            const mySecondUser = await user.findFirst({
                where: {
                    id: secondUserId,
                    deleted_status: 0,
                    role: {
                        privileges: {
                            some: {
                                OR: [{ action: "admin" }, { action: "super" }],
                            },
                        },
                    },
                },
            });
            if (mySecondUser) {
                error(
                    "id",
                    "user doesn't have privilege (admin cant update admin)",
                    next,
                    403
                );
                return false;
            }
            return true;
        }
    },
    isUserSuper: async (id) => {},
    authenticate: async (req, res, next) => {
        const requestRoute = req.path.split("/").pop();
        const requestPath = req.path.split("/");
        const pass =
            req.path.search(/\/api-docs\/|\/uploads\//) == -1 ? false : true;
        const method = req.method;
        if (
            requestRoute == "login" ||
            requestRoute == "logout" ||
            requestRoute == "forgotpassword" ||
            requestRoute == "refresh" ||
            requestRoute == "sendcode" ||
            requestRoute == "confirm_account" ||
            pass
        ) {
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
        // const PRIVILEGE_TYPE = `${requestRoute}_${method}`;
        const PRIVILEGE_TYPE = requestPath.match("hcm")
            ? "hcm"
            : requestPath.match("finance")
            ? "finance"
            : requestPath.match("project")
            ? "project"
            : requestPath.match(/role|privilege/)
            ? "admin"
            : requestPath.match("account") && method === "POST"
            ? "admin"
            : "no privilege";
        if (
            requestRoute == "account" &&
            (method == "PATCH" || method == "DELETE")
        ) {
            if (
                !(await authorization.userHasPrivilegeOver(
                    payLoad.id,
                    req.body.id,
                    PRIVILEGE_TYPE + req.body.role_id
                        ? `ROLE_${req.body.role_id}`
                        : "",
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
