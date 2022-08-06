const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");

const { indexService } = require("../../../services/projectDashboard");

router.get("/", async (req, res, next) => {
    try {
        res.json(await indexService(res.locals.id));
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});

module.exports = router;
