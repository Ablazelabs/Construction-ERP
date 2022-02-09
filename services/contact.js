const { allModels } = require("../config/config");
const { contact } = allModels;
const post = async (
    { contact: contactData, contactPersons, contactAddresses },
    creator,
    next
) => {
    const defaultValues = {
        createdBy: String(creator),
        revisedBy: String(creator),
    };
    const returned = await contact.create({
        data: {
            ...contactData,
            ...defaultValues,
            contact_address: {
                createMany: {
                    data: contactAddresses.map((elem) => {
                        return { ...elem, ...defaultValues };
                    }),
                    skipDuplicates: true,
                },
            },
            contact_person: {
                createMany: {
                    data: contactPersons.map((elem) => {
                        return { ...elem, ...defaultValues };
                    }),
                    skipDuplicates: true,
                },
            },
        },
    });
    return { success: Boolean(returned) };
};
const patch = async (
    { contact: contactData, contactPersons, contactAddresses },
    id,
    creator,
    next
) => {
    const defaultValues = {
        revisedBy: String(creator),
        createdBy: String(creator),
    };
    const returned = await contact.update({
        where: {
            id,
        },
        data: {
            contact_address: {
                deleteMany: {},
                createMany: {
                    data: contactAddresses.map((elem) => {
                        return { ...elem, ...defaultValues };
                    }),
                    skipDuplicates: true,
                },
            },
            contact_person: {
                updateMany: { where: {}, data: { status: 1 } },
                createMany: {
                    data: contactPersons.map((elem) => {
                        return { ...elem, ...defaultValues };
                    }),
                    skipDuplicates: true,
                },
            },
            ...contactData,
            revisedBy: defaultValues.revisedBy,
        },
    });
    return { success: Boolean(returned) };
};

module.exports = {
    post,
    patch,
};
// same as the others
