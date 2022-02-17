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
    const headerRow = [
        "ተ.ቁ",
        "የሻጭ ድርጅት/ግለሰብ ስም",
        "የግብር ከፋይ መለያ ቁጥር",
        "የቃው ዋጋ",
        "የተጨማሪ ዕሴት ታክስ",
        "ዊዝሆልዲንግ ታክስ",
        "የሽያጭ መመዝገቢያ መለያ ኮድ",
        "ቁጥር",
        "ቀን",
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
    let sheetOptions = { "!merges": mergeRanges, "!rows": [{ hpx: 30 }] };
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
        sheetOptions["!rows"][recordIndex] = { hpx: 11 };
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
