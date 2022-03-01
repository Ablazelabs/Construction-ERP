const { allModels } = require("../config/config");
const { chart_of_account } = allModels;
/**
 *
 * @param {{
 *  exportAs:"xlsx"|"csv",
 *  from: Date,
 *  to: Date,
 *  template_id: Number,
 *  filter: ,
 *  period_filter: ,
 * }} reqBody
 * @param {*} creator
 * @param {*} next
 */
const exporter = async (reqBody, creator, next) => {};
const getName = async () => {
    const data = await chart_of_account.findMany({
        where: {
            account_type: {
                account_category: {
                    id: { not: 0 },
                },
            },
        },
        select: {
            account_type: {
                select: {
                    account_category: true,
                },
            },
        },
    });
    return data.map((elem) => elem?.account_type?.account_category);
};
module.exports = { exporter };
