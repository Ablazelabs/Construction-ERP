//this module performs authorization for users
const { verify } = require("jsonwebtoken");
const { error, allModels, getOperationDataType } = require("../config/config");
const { user } = allModels;
const authorization = {
    /**
     *
     * @param {number} userId
     * @param {string} privilege
     * @param {Function} next
     * @desc calls error if user isn't authenticated
     */
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
                                { action: privilege.replace("TWO", "ONE") },
                                { action: "admin" },
                                { action: "HEAD" },
                                { action: "super" },
                            ],
                        },
                    },
                },
            },
        });
        if (!myUser) {
            error("id", "you don't have enough privileges", next, 403);
            return false;
        }
        return true;
    },
    /* Checking if the user has the privilege to update the user. */
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
            error("id", "you don't have enough privileges", next, 403);
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
                    "user doesn't have privilege (admin can't update admin)",
                    next,
                    403
                );
                return false;
            }
            return true;
        }
    },
    /* Checking if the user is a super user. */
    isUserSuper: async (id) => {
        const myUser = await user.findFirst({
            where: {
                id,
                role: {
                    privileges: { some: { action: "super" } },
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
        return Boolean(myUser);
    },
    /**
     * make a readable code!
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
    authenticate: async (req, res, next) => {
        const requestRoute = getOperationDataType(req.path);
        const requestPath = req.path.toLowerCase();
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
        let PRIVILEGE_TYPE = requestPath.match("hcm")
            ? "HCM_TWO"
            : requestPath.match("sales")
            ? "SALES_TWO"
            : requestPath.match(/project|client/)
            ? "PROJECT_TWO"
            : requestPath.match("finance")
            ? "FINANCE_TWO"
            : requestPath.match(/role|privilege/)
            ? "admin"
            : requestRoute == "account" && method === "POST"
            ? "admin"
            : "*";
        // const additionalPrivileges =
        //     PRIVILEGE_TYPE === "HCM_TWO" ||
        //     PRIVILEGE_TYPE === "FINANCE_TWO" ||
        //     PRIVILEGE_TYPE === "PROJECT_TWO"
        //         ? [
        //                &&
        //                   `${PRIVILEGE_TYPE}_manager`,
        //           ].filter((elem) => elem)
        //         : [];
        if (requestPath.match("/master/")) {
            PRIVILEGE_TYPE = PRIVILEGE_TYPE.replace("TWO", "ONE");
        }
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
            if (requestRoute === "account" || method === "GET") {
                next();
                return;
            }
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
