const validator = {
    checkType: (value, type) => {
        if (typeof value != type) {
            throw `please send ${type}`;
        }
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
            //handle the number 0(  returns false )
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
        throw { key: e, message: "is empty or wasn't set" };
    }
    for (let i in optionalObj) {
        if (givenObj[i] != undefined) {
            try {
                validator.checkType(givenObj[i], optionalObj[i]);
                if (optionalObj == "string" || optionalObj == "array") {
                    validator.checkLength(givenObj[i], minLength, 0);
                    validator.checkLength(givenObj[i], maxLength);
                }
            } catch (e) {
                throw { key: i, message: e };
            }
        }
    }
    for (let i in expectedObj) {
        try {
            validator.checkType(givenObj[i], expectedObj[i]);
            if (expectedObj[i] == "string" || expectedObj[i] == "array") {
                validator.checkLength(givenObj[i], minLength, 0);
                validator.checkLength(givenObj[i], maxLength);
            }
        } catch (e) {
            throw { key: i, message: e };
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
