const { error } = require("../../../config/config");
const inputFilter = require("../../../validation/inputFilter");

/**
 *
 * @param {object} reqBody
 * @param {function} next
 */
module.exports = (reqBody, next) => {
    let newReqBody = { ...reqBody };
    const { aa_type, is_annual_leave, is_with_quota } = reqBody;
    if (aa_type == 2) {
        try {
            inputFilter(
                {
                    is_with_quota: "boolean",
                    is_with_pay: "boolean",
                    is_with_entitlement: "boolean",
                },
                {},
                reqBody
            );
        } catch (e) {
            error(e.key, "is required if aa_type is absence", next);
            return false;
        }
        if (is_with_quota) {
            try {
                inputFilter(
                    {
                        number_of_days: "number",
                    },
                    {},
                    reqBody
                );
            } catch (e) {
                error(
                    e.key,
                    e.key + " is required if absence is with quota",
                    next
                );
                return false;
            }
        } else {
            delete newReqBody.number_of_days;
        }
    } else {
        delete newReqBody.is_with_quota;
        delete newReqBody.is_with_pay;
        delete newReqBody.is_with_entitlement;
        delete newReqBody.number_of_days;
    }
    if (is_annual_leave) {
        try {
            inputFilter(
                {
                    number_of_increment_each_year: "number",
                },
                {},
                reqBody
            );
        } catch (e) {
            error(e.key, "is required if absence is annual leave", next);
            return false;
        }
    } else {
        delete newReqBody.number_of_increment_each_year;
    }
    return newReqBody;
};
