const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const { genSalt, hash } = require("bcrypt");

async function main() {
    await handlePrivileges();
    // await handleUsers();
    await handleActionReason();
}

const handleUsers = async () => {
    const salt = await genSalt(10);
    const hashPassword = await hash("password", salt);
    await prisma.user.upsert({
        where: { email: "hello@gmail.com" },
        update: {
            concurrency_stamp: "random",
        },
        create: {
            email: "hello@gmail.com",
            password: hashPassword,
            code: 333,
            concurrency_stamp: "random",
            first_login: false,
            username: "SUPER USER",
            role: {
                connectOrCreate: {
                    create: {
                        concurrency_stamp: "random",
                        name: "super role",
                        deleted_status: 1,
                        description: "this role should stay deleted",
                        privileges: { connect: { action: "super" } },
                    },
                    where: {
                        name: "super role",
                    },
                },
            },
        },
    });
    await prisma.user.upsert({
        where: { email: "project@gmail.com" },
        update: {
            concurrency_stamp: "random",
        },
        create: {
            email: "project@gmail.com",
            password: hashPassword,
            code: 333,
            concurrency_stamp: "random",
            first_login: false,
            username: "Project USER",
            role: {
                connectOrCreate: {
                    create: {
                        concurrency_stamp: "random",
                        name: "project role",
                        deleted_status: 0,
                        description: "project user role",
                        privileges: { connect: { action: "PROJECT_TWO" } },
                    },
                    where: {
                        name: "project role",
                    },
                },
            },
        },
    });
    await prisma.user.upsert({
        where: { email: "projectmanager@gmail.com" },
        update: {
            concurrency_stamp: "random",
        },
        create: {
            email: "projectmanager@gmail.com",
            password: hashPassword,
            code: 333,
            concurrency_stamp: "random",
            first_login: false,
            username: "Project Manager",
            role: {
                connectOrCreate: {
                    create: {
                        concurrency_stamp: "random",
                        name: "project manager role",
                        deleted_status: 0,
                        description: "project manager role",
                        privileges: { connect: { action: "PROJECT_ONE" } },
                    },
                    where: {
                        name: "project manager role",
                    },
                },
            },
        },
    });
    await prisma.user.upsert({
        where: { email: "hcmmanager@gmail.com" },
        update: {
            concurrency_stamp: "random",
        },
        create: {
            email: "hcmmanager@gmail.com",
            password: hashPassword,
            code: 333,
            concurrency_stamp: "random",
            first_login: false,
            username: "HCM Manager",
            role: {
                connectOrCreate: {
                    create: {
                        concurrency_stamp: "random",
                        name: "hcm manager role",
                        deleted_status: 0,
                        description: "hcm manager role",
                        privileges: { connect: { action: "HCM_ONE" } },
                    },
                    where: {
                        name: "hcm manager role",
                    },
                },
            },
        },
    });
    await prisma.user.upsert({
        where: { email: "hcm@gmail.com" },
        update: {
            concurrency_stamp: "random",
        },
        create: {
            email: "hcm@gmail.com",
            password: hashPassword,
            code: 333,
            concurrency_stamp: "random",
            first_login: false,
            username: "HCM User",
            role: {
                connectOrCreate: {
                    create: {
                        concurrency_stamp: "random",
                        name: "hcm role",
                        deleted_status: 0,
                        description: "hcm role",
                        privileges: { connect: { action: "HCM_TWO" } },
                    },
                    where: {
                        name: "hcm role",
                    },
                },
            },
        },
    });
    await prisma.user.upsert({
        where: { email: "finance@gmail.com" },
        update: {
            concurrency_stamp: "random",
        },
        create: {
            email: "finance@gmail.com",
            password: hashPassword,
            code: 333,
            concurrency_stamp: "random",
            first_login: false,
            username: "finance User",
            role: {
                connectOrCreate: {
                    create: {
                        concurrency_stamp: "random",
                        name: "finance role",
                        deleted_status: 0,
                        description: "finance role",
                        privileges: { connect: { action: "FINANCE_TWO" } },
                    },
                    where: {
                        name: "finance role",
                    },
                },
            },
        },
    });
    await prisma.user.upsert({
        where: { email: "financemanager@gmail.com" },
        update: {
            concurrency_stamp: "random",
        },
        create: {
            email: "financemanager@gmail.com",
            password: hashPassword,
            code: 333,
            concurrency_stamp: "random",
            first_login: false,
            username: "FINANCE Manager",
            role: {
                connectOrCreate: {
                    create: {
                        concurrency_stamp: "random",
                        name: "finance manager role",
                        deleted_status: 0,
                        description: "finance manager role",
                        privileges: { connect: { action: "FINANCE_ONE" } },
                    },
                    where: {
                        name: "finance manager role",
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
                action: "HEAD",
                concurrency_stamp: "random",
                deleted_status: 0,
                description:
                    "head of all project, hcm and finance. company manager",
            },
            {
                action: "HCM_ONE",
                concurrency_stamp: "random",
                deleted_status: 0,
                description:
                    "hcm manager privilege, can change or create master data",
            },
            {
                action: "HCM_TWO",
                concurrency_stamp: "random",
                deleted_status: 0,
                description:
                    "junior hrs to do operations. people with this privilege don't have master access.",
            },
            {
                action: "PROJECT_ONE",
                concurrency_stamp: "random",
                deleted_status: 0,
                description:
                    "project manager privilege. people with this role can check requests and also have master data access",
            },
            {
                action: "PROJECT_TWO",
                concurrency_stamp: "random",
                deleted_status: 0,
                description:
                    "normal users with normal projects access, they can submit reports and other features, but not master data",
            },
            {
                action: "FINANCE_ONE",
                concurrency_stamp: "random",
                deleted_status: 0,
                description:
                    "finance managers who can approve payment requests and have access to master",
            },
            {
                action: "FINANCE_TWO",
                concurrency_stamp: "random",
                deleted_status: 0,
                description:
                    "finance users who have access to operations like submitting pv requests and pettycash",
            },
            {
                action: "SALES_ONE",
                concurrency_stamp: "random",
                deleted_status: 0,
                description: "sales users who have access to master data",
            },
            {
                action: "SALES_TWO",
                concurrency_stamp: "random",
                deleted_status: 0,
                description: "sales users who have access to operations",
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
                startDate: new Date(),
                endDate: new Date(),
                createdBy: "seed",
                revisedBy: "seed",
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
