const { snakeToPascal } = require("../config/config");

const validator = {
    checkType: (value, type) => {
        if (typeof value != type) {
            if (type === "string" && typeof value === "number") {
                return String(value);
            }
            if (
                type === "number" &&
                typeof value === "string" &&
                value !== ""
            ) {
                const valueNum = Number(value);
                if (!isNaN(valueNum)) {
                    return valueNum;
                }
            }
            throw `please send ${type}`;
        }
        return value;
    },
    checkLength: (value, length, minmax = 1) => {
        if (minmax == 0) {
            if (value.length < length) {
                throw `minimum length is ${length}`;
            }
        } else {
            if (value.length > length) {
                throw `maximum length is ${length}`;
            }
        }
    },
    //checkes if expected keys are sent within the object(req.body object mostly)
    checkKeys: (keys, obj) => {
        for (let i in keys) {
            //handle the number 0 and false
            if (obj[keys[i]] === 0) {
                return;
            }
            if (obj[keys[i]] === false) {
                return;
            }
            if (!obj[keys[i]]) {
                throw keys[i];
            }
        }
    },
};

/**
 *
 * @param {object} expectedObj givenObj requires this objet's keys(and type also)
 * @param {object} optionalObj givenObj doesn't require this objet's keys(type conflict raises error also)
 * @param {object} givenObj the object to be filtered
 * @param {number} minLength minimum length of string length in givenObj
 * @param {number} maxLength maximum number of string length in givenObj
 * @returns object
 */

/**
 * It takes in an object with keys and values of the expected data type, an object with keys and values
 * of the optional data type, an object with the data to be validated, a minimum length and a maximum
 * length. It returns an object with the validated data
 * @param expectedObj - This is the object that contains the keys that are required.
 * @param optionalObj - This is the object that contains the keys that are optional.
 * @param givenObj - the object that is being validated
 * @param [minLength=0] - minimum length of string or array
 * @param [maxLength=300] - the maximum length of the string or array
 * @returns An object with the keys of the givenObj that are in the expectedObj or optionalObj.
 */
module.exports = (
    expectedObj,
    optionalObj,
    givenObj,
    minLength = 0,
    maxLength = 300
) => {
    /**
     * expectedObj has the format
     * {
     *  a:'string',
     *  b:'int',
     *  c:'array',
     * }
     * means a,b,c are expected and are necessary
     * optionalObj has the same format only that it wont throw if empty(it throws if wrong type given)
     */
    const keys = Object.keys(expectedObj);
    try {
        validator.checkKeys(keys, givenObj);
    } catch (e) {
        throw { key: e, message: `${snakeToPascal(e)} is empty or wasn't set` };
    }
    for (let i in optionalObj) {
        if (givenObj[i] != undefined && optionalObj[i] != undefined) {
            try {
                givenObj[i] = validator.checkType(givenObj[i], optionalObj[i]);
                if (optionalObj[i] == "string" || optionalObj[i] == "array") {
                    validator.checkLength(givenObj[i], minLength, 0);
                    validator.checkLength(givenObj[i], maxLength);
                }
            } catch (e) {
                throw { key: i, message: `${snakeToPascal(i)} ${e}` };
            }
        }
    }
    for (let i in expectedObj) {
        if (!expectedObj[i]) {
            continue;
        }
        try {
            givenObj[i] = validator.checkType(givenObj[i], expectedObj[i]);
            if (expectedObj[i] == "string" || expectedObj[i] == "array") {
                validator.checkLength(givenObj[i], minLength, 0);
                validator.checkLength(givenObj[i], maxLength);
            }
        } catch (e) {
            throw { key: i, message: `${snakeToPascal(i)} ${e}` };
        }
    }
    let returnedObj = {};
    for (let i in optionalObj) {
        if (givenObj[i] || givenObj[i] === 0 || givenObj[i] === false)
            returnedObj[i] = givenObj[i];
    }
    for (let i in expectedObj) {
        if (givenObj[i] || givenObj[i] === 0 || givenObj[i] === false)
            returnedObj[i] = givenObj[i];
    }
    return returnedObj;
};
