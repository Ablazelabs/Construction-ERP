const express = require("express");
const router = express.Router();
const { error, logError } = require("../../../config/config");

const { indexService } = require("../../../services/projectDashboard");

router.get("/", async (req, res, next) => {
    try {
        res.json(await indexService(res.locals.id));
    } catch (e) {
        console.log(e);
        logError(e);
        error("database", "error", next, 500);
    }
});

module.exports = router;
