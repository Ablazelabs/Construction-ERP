const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const { genSalt, hash } = require("bcrypt");

async function main() {
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
    const salt = await genSalt(10);
    const hashPassword = await hash("password", salt);
    await prisma.user.upsert({
        where: { email: "yaredterefeg@gmail.com" },
        update: {},
        create: {
            email: "yaredterefeg@gmail.com",
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
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
