const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const { genSalt, hash } = require("bcrypt");

async function main() {
    await handlePrivileges();
    await handleUsers();
    await handleActionReason();
}

const handleUsers = async () => {
    const salt = await genSalt(10);
    const hashPassword = await hash("password", salt);
    await prisma.user.upsert({
        where: { email: "hello@gmail.com" },
        update: {},
        create: {
            email: "hello@gmail.com",
            password: hashPassword,
            code: 333,
            concurrency_stamp: "random",
            first_login: false,
            username: "yared terefe",
            role: {
                connectOrCreate: {
                    create: {
                        concurrency_stamp: "random",
                        name: "super role",
                        deleted_status: 1,
                        description: "this role should stay deleted",
                        privileges: {
                            connect: {
                                action: "super",
                            },
                        },
                    },
                    where: {
                        name: "super role",
                    },
                },
            },
        },
    });
};

const handlePrivileges = async () => {
    await prisma.privilege.createMany({
        data: [
            {
                action: "super",
                concurrency_stamp: "random",
                deleted_status: 1,
                description:
                    "super privilege! this privilege should stay deleted",
            },
            {
                action: "admin",
                concurrency_stamp: "random",
                deleted_status: 0,
                description: "admin privilege!",
            },
            {
                action: "hcm",
                concurrency_stamp: "random",
                deleted_status: 0,
                description: "hcm privilege!",
            },
            {
                action: "project",
                concurrency_stamp: "random",
                deleted_status: 0,
                description: "hcm privilege!",
            },
            {
                action: "finance",
                concurrency_stamp: "random",
                deleted_status: 0,
                description: "hcm privilege!",
            },
            {
                action: "manager",
                concurrency_stamp: "random",
                deleted_status: 0,
                description: "hcm privilege!",
            },
        ],
        skipDuplicates: true,
    });
};

const handleActionReason = async () => {
    const actionReason = await prisma.action_reason.findFirst({
        where: {
            action_type_code: "Hiring",
        },
    });
    if (!actionReason) {
        await prisma.action_reason.create({
            data: {
                action_type_code: "Hiring",
                reason_description:
                    "Auto Generated Action Reason, This is used for hiring an employee and its automatic, and can't be fetched",
                status: 0,
            },
        });
    } else if (!actionReason.status) {
        await prisma.action_reason.update({
            where: {
                id: actionReason.id,
            },
            data: {
                status: 1,
            },
        });
    }
};

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
