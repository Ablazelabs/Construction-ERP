const fs = require("fs");
let data = require("./previousDoc.json");
const hcmEmployeeMaster = require("./hcmEmployeeMaster.json");
const allNewDocs = {
    hcmEmployeeMaster,
};
for (let i in allNewDocs) {
    for (let k in allNewDocs[i]) {
        data.paths[k] = allNewDocs[i][k];
    }
}
module.exports = data;
