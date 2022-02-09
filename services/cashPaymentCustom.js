const { allModels } = require("../config/config");

const { cash_payment_custom } = allModels;

/**
 *
 * @param {Date} from
 * @param {Date} to
 */
const getExportedPdf = async (from, to) => {
    const customCashPayment = { from, to };
    const custom = await cash_payment_custom.findMany({
        where: {
            status: 0,
            date: {
                gte: from,
                lte: to,
            },
        },
    });
};
module.exports = { getExportedPdf };
