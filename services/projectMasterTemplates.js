const xlsx = require("node-xlsx");
module.exports = (type) => {
    const firstRow =
        type == 0
            ? [
                  "name",
                  "tradeName",
                  "address",
                  "city",
                  "tel",
                  "tinNumber",
                  "subCity",
                  "woreda",
                  "contactPersonName",
                  "contactPersonPhone",
                  "contactPersonEmail",
                  "email",
              ]
            : type == 6
            ? ["name", "description", "unit", "material_category_id"]
            : type == 8
            ? ["name", "description", "color"]
            : type == 11
            ? ["name", "description", "document_category_id"]
            : ["name", "description"];
    const dataSheet = [firstRow];
    const buffer = xlsx.build([
        {
            name: "sheet 1",
            data: dataSheet,
        },
    ]);
    return buffer;
};
