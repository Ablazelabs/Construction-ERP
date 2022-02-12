const { allModels } = require("../config/config");
const xlsx = require("node-xlsx");
const { crv_payment } = allModels;

/**
 *
 * @param {Date} from
 * @param {Date} to
 * @param {number} project_id
 * @param {number} crv_types
 * @param {string} customer_name
 */
const getExportedExcel = async (
    from,
    to,
    project_id,
    crv_types,
    customer_name
) => {
    const customCashPayment = {
        from,
        to,
        project_id,
        crv_types,
        customer_name,
    };
    if (customCashPayment.customer_name || customCashPayment.project_id) {
        if (customCashPayment.crv_types == 1)
            var custom = await crv_payment.findMany({
                where: {
                    status: 0,
                    date: {
                        gte: customCashPayment.from,
                        lte: customCashPayment.to,
                    },
                    customer_name: customCashPayment.customer_name,
                    crv_type: {
                        crv_types: 1,
                    },
                },
                include: {
                    crv_type: true,
                },
            });
        else
            var custom = await crv_payment.findMany({
                where: {
                    status: 0,
                    date: {
                        gte: customCashPayment.from,
                        lte: customCashPayment.to,
                    },
                    project_id: customCashPayment.project_id,
                    crv_type: {
                        crv_types: customCashPayment.crv_types,
                    },
                },
                include: {
                    crv_type: true,
                },
            });
    } else {
        var custom = await crv_payment.findMany({
            where: {
                status: 0,
                date: {
                    gte: customCashPayment.from,
                    lte: customCashPayment.to,
                },
                crv_type: {
                    crv_types: customCashPayment.crv_types,
                },
            },
            include: {
                crv_type: true,
            },
        });
    }
    //make the export here i guess
    let dataSheet = [];
    const headerRow = [
        "No.",
        "Project/ Customer Name",
        "Payment Description",
        "Amount Before Vat",
        "Vat",
        "Amount With Vat",
        "Withholding",
        "CRV Type",
        "Cash/ Check Amount",
    ];
    let mergeRanges = [];
    //excel to c,r translations
    //a,b,c === c:[0,1,2]
    //1,2,3 === r:[0,1,2]
    for (let i = 0; i < 4; i++) {
        mergeRanges.push({ s: { c: 0, r: 0 + i }, e: { c: 1, r: 0 + i } });
    }
    mergeRanges.push({ s: { c: 3, r: 3 }, e: { c: 6, r: 3 } }); //D4:G4
    mergeRanges.push({ s: { c: 7, r: 3 }, e: { c: 8, r: 3 } }); //H4:I4
    let sheetOptions = { "!merges": mergeRanges, "!row": [{ hpx: 30 }] };
    xlsx.build([{ data: [], options: {} }]);
    //setting data on a
    dataSheet[0] = [`ግብር ከፋይ መለያ ቁጥር - 0062451276`];
    dataSheet[1] = [`የግብር ከፋይ ስም - El-Hadar Engineering & Trading P.L.C`];
    dataSheet[2] = [`የስራው ዓይነት - Almunium & Metal & Electro Mechanical Work`];
    dataSheet[3] = [
        `ሪፖርት የተደረገበት ወር - ${customCashPayment.from.toDateString()} - Up To : ${customCashPayment.to.toDateString()}`,
        "",
        "",
        "የተከፈለው ገንዘብ መጠን በብር",
        "",
        "",
        "",
        "ግዢው የተፈፀመበት ደረሰኝ",
    ];
    dataSheet[4] = headerRow;
    let recordIndex = 5;
    for (let i in custom) {
        const item = custom[i];
        sheetOptions["!row"][recordIndex] = { hpx: 11 };
        //only height works, no bolding or font style option
        dataSheet[recordIndex] = [
            parseInt(i) + 1,
            item.crv_type.crv_types === 1 ? item.customer_name : item.name,
            item.payment_description,
            item.amount_before_vat,
            item.vat,
            item.amount_with_vat,
            item.withholding,
            item.crv_type.name,
            item.crv_type.crv_types === 1
                ? item.cash_amount
                : item.check_amount,
        ];
        i++;
        recordIndex++;
    }
    for (let i = 0; i < dataSheet.length; i++) {
        if (dataSheet[i]) {
            continue;
        }
        dataSheet[i] = [];
    }
    const buffer = xlsx.build([
        {
            name: "sheet 1",
            data: dataSheet,
            options: sheetOptions,
        },
    ]);
    return buffer;
};
module.exports = { getExportedExcel };
