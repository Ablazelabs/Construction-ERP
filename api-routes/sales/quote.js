const express = require("express");
const inputFilter = require("../../validation/inputFilter");
const { allModels, error } = require("../../config/config");
const { sales_data: personal_details } = allModels;
const router = express.Router();
router.post("/customer-form", async (req, res, next) => {
    let reqBody = {};
    try {
        reqBody = inputFilter(
            {
                name_of_company: "string",
                full_name: "string",
            },
            {
                email: "string",
                phone_number: "string",
                street_name: "string",
                region: "string",
                city: "string",
                sales_rep: "string",
                ltz_profile: "boolean",
                curtain_profile: "boolean",
                fasha_zocolo: "boolean",
                oval_flat_ferma: "boolean",
                sliding_cup: "boolean",
                pressure_plate: "boolean",
                RHS: "boolean",
                external_internal_profile: "boolean",
                clear: "boolean",
                reflective: "boolean",
                tinted: "boolean",
                tempered: "boolean",
                laminated: "boolean",
                silver: "boolean",
                coffee: "boolean",
                black: "boolean",
                grey: "boolean",
                ivory: "boolean",
                other_profile_text: "string",
                other_glass_text: "string",
                other_aluminum_text: "string",
                quantity_remark: "string",
            },
            req.body
        );
    } catch (e) {
        error(e.key, e.message, next, 400);
        return;
    }
    try {
        await personal_details.create({
            data: {
                ...reqBody,
                startDate: new Date(),
                endDate: new Date(),
                createdBy: `${res.locals.id}`,
                revisedBy: `${res.locals.id}`,
            },
        });
        res.json({ success: true });
    } catch (e) {
        console.log(e);
        res.status(500).json({ database: "error" });
    }
});
router.get("/customer-form", async (req, res, next) => {
    let { limit } = req.query;
    let { skip } = req.query;
    limit = parseInt(limit) || 0;
    skip = parseInt(skip) || 0;
    if (limit < 0) {
        limit = 0;
    }
    if (skip < 0) {
        skip = 0;
    }
    let data = [];
    try {
        data = await personal_details.findMany({
            take: limit,
            skip,
            orderBy: [{ isContacted: "asc" }, { creationDate: "desc" }],
        });
    } catch (e) {
        console.log(e);
        res.status(500).send("something went wrong");
        return;
    }
    const sendData = data.map(
        ({
            id,
            name_of_company,
            full_name,
            email,
            phone_number,
            street_name,
            city,
            region,
            sales_rep,
            quantity_remark,
            other_profile_text,
            other_glass_text,
            other_aluminum_text,
            ltz_profile,
            curtain_profile,
            fasha_zocolo,
            oval_flat_ferma,
            sliding_cup,
            pressure_plate,
            RHS,
            external_internal_profile,
            clear,
            reflective,
            tinted,
            tempered,
            laminated,
            silver,
            coffee,
            black,
            grey,
            ivory,
            isContacted,
            creationDate,
        }) => {
            let returnedData = {
                id,
                name_of_company,
                full_name,
                email,
                phone_number,
                street_name,
                city,
                region,
                sales_rep,
                quantity_remark,
                isContacted,
                created_time: creationDate,
            };
            const booleanRealNames = {
                ltz_profile: "L, T, Z Profile",
                curtain_profile: "Curtain Profile",
                fasha_zocolo: "Fasha & Zocolo",
                oval_flat_ferma: "Oval & Flat Ferma",
                sliding_cup: "Siding Cup",
                pressure_plate: "Pressure Plate",
                RHS: "RHS",
                external_internal_profile: "External & Internal Profile",
                clear: "Clear",
                reflective: "Reflective",
                tinted: "Tinted",
                tempered: "Tempered",
                laminated: "Laminated",
                silver: "Silver",
                coffee: "Coffee",
                black: "Black",
                grey: "Grey",
                ivory: "Ivory",
            };
            const booleans = {
                aluminum_profile: {
                    ltz_profile,
                    curtain_profile,
                    fasha_zocolo,
                    oval_flat_ferma,
                    sliding_cup,
                    pressure_plate,
                    RHS,
                    external_internal_profile,
                    other_profile_text,
                },
                glass_color: {
                    clear,
                    reflective,
                    tinted,
                    tempered,
                    laminated,
                    other_glass_text,
                },
                aluminum_color: {
                    silver,
                    coffee,
                    black,
                    grey,
                    ivory,
                    other_aluminum_text,
                },
            };
            const arrays = {
                aluminum_profile: [],
                glass_color: [],
                aluminum_color: [],
            };
            for (let i in booleans) {
                for (let k in booleans[i]) {
                    if (k.search(/.*text.*/) !== -1) {
                        if (booleans[i][k]) {
                            arrays[i].push(booleans[i][k]);
                        }
                    } else if (booleans[i][k]) {
                        arrays[i].push(booleanRealNames[k]);
                    }
                }
            }
            return { ...returnedData, ...arrays };
        }
    );
    res.json(sendData);
});
router.patch("/customer-form", async (req, res, next) => {
    let reqBody = {};
    try {
        reqBody = inputFilter({ id: "number" }, {}, req.body);
        reqBody.id = Math.floor(reqBody.id);
        if (reqBody.id < 1) {
            throw { key: "id", message: "can't be less than 1" };
        }
    } catch (e) {
        error(e.key, e.message, next, 400);
        return;
    }
    const { id } = reqBody;
    try {
        await personal_details.update({
            where: { id },
            data: {
                isContacted: true,
            },
        });
        res.json({ success: true });
    } catch {
        error("id", "no data exists with this id", next, 400);
    }
});
module.exports = router;
