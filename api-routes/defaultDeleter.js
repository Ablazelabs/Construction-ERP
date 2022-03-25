const { error } = require("../config/config");
const inputFilter = require("../validation/inputFilter");
const { deleter: mDelete } = require("../services/mostCRUD/mostCRUD");

module.exports = async (req, res, next) => {
    const operationDataType = req.path.split("/").pop();
    try {
        inputFilter({ id: "number" }, {}, req.body);
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    try {
        res.json(await mDelete(req.body.id, operationDataType));
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
        return;
    }
};
