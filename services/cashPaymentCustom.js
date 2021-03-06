const { allModels } = require("../config/config");
const xlsx = require("node-xlsx");
const { cash_payment_custom } = allModels;

/**
 *
 * @param {Date} from
 * @param {Date} to
 */
const getExportedExcel = async (from, to) => {
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
    //make the export here i guess
    let dataSheet = [];
    //why is this in particular in amharic? no reason! đ¤ˇââď¸
    const headerRow = [
        "á°.á",
        "á¨áťá­ áľá­ááľ/ááá°áĽ áľá",
        "á¨ááĽá­ á¨áá­ áááŤ ááĽá­",
        "á¨áá áá",
        "á¨á°á¨ááŞ áá´áľ áłá­áľ",
        "ááááá˛áá áłá­áľ",
        "á¨á˝áŤá­ ááááá˘áŤ áááŤ áŽáľ",
        "ááĽá­",
        "áá",
    ];
    let mergeRanges = [];
    //excel to c,r translations
    //a,b,c === c:[0,1,2]
    //1,2,3 === r:[0,1,2]
    for (let i = 0; i < 4; i++) {
        mergeRanges.push({ s: { c: 0, r: 0 + i }, e: { c: 1, r: 0 + i } });
    }
    mergeRanges.push({ s: { c: 3, r: 3 }, e: { c: 6, r: 3 } }); //D4:G4
    mergeRanges.push({ s: { c: 7, r: 3 }, e: { c: 8, r: 3 } });
    let sheetOptions = {
        "!merges": mergeRanges,
        "!rows": [{ hpx: 60 }],
        "!cols": Array(4).fill({ wch: 50 }),
    };
    xlsx.build([{ data: [], options: {} }]);
    //setting data on a
    dataSheet[0] = [`ááĽá­ á¨áá­ áááŤ ááĽá­ - 0062451276`];
    dataSheet[1] = [`á¨ááĽá­ á¨áá­ áľá - El-Hadar Engineering & Trading P.L.C`];
    dataSheet[2] = [`á¨áľáŤá áá­ááľ - Almunium & Metal & Electro Mechanical Work`];
    dataSheet[3] = [
        `áŞáá­áľ á¨á°á°á¨áá áľ áá­ - ${customCashPayment.from.toDateString()} - Up To : ${customCashPayment.to.toDateString()}`,
        "",
        "",
        "á¨á°á¨ááá ááááĽ áá á á áĽá­",
        "",
        "",
        "",
        "áá˘á á¨á°áááá áľ á°á¨á°á",
    ];
    dataSheet[4] = headerRow;
    let recordIndex = 5;
    for (let i in custom) {
        const item = custom[i];
        sheetOptions["!rows"][recordIndex] = { hpx: 11 };
        // sheetOptions["!cols"][recordIndex] = { wch: 50 }; //this may be important
        //only height works, no bolding or font style option
        dataSheet[recordIndex] = [
            parseInt(i) + 1,
            item.customer,
            item.tin_number,
            item.amount,
            item.tax,
            item.withholding,
            item.merchant_record_card_code,
            item.number,
            item.date,
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
