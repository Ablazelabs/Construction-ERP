const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const inputFilter = require("../../../validation/inputFilter");
const { indexService } = require("../../../services/projectDashboard");

const allRoutes = [
    "/manpower_requirement",
    "/required_equipment",
    "/required_material",
    "/request",
    "/required_document",
    "/request_payment",
];
router.get("/", async (req, res, next) => {
    try {
        res.json(await indexService());
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});

module.exports = router;
