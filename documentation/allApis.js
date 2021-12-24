const fs = require("fs");
let data = require("./previousDoc.json");
const hcmEmployeeMaster = require("./hcmEmployeeMaster.json");
const hcmCompanyStructure = require("./hcmCompanyStructure.json");
const hcmRecruitment = require("./hcmRecruitment.json");
const hcmJobPositions = require("./hcmJobPositions.json");
const hcmPayrolls = require("./hcmPayrolls.json");
const hcmTimeAndLeave = require("./hcmTimeAndLeave.json");
const inventMaster = require("./inventMaster.json");
const inventStock = require("./inventStock.json");
const allNewDocs = {
    hcmEmployeeMaster,
    hcmCompanyStructure,
    hcmRecruitment,
    hcmJobPositions,
    hcmPayrolls,
    hcmTimeAndLeave,
    inventMaster,
    inventStock,
};
for (let i in allNewDocs) {
    for (let k in allNewDocs[i]) {
        data.paths[k] = allNewDocs[i][k];
    }
}
module.exports = data;
