-- CreateTable
CREATE TABLE `client` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `tradeName` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NULL,
    `tel` VARCHAR(191) NOT NULL,
    `tinNumber` VARCHAR(191) NOT NULL,
    `subCity` VARCHAR(191) NULL,
    `woreda` VARCHAR(191) NULL,
    `contactPersonName` VARCHAR(191) NOT NULL,
    `contactPersonPhone` VARCHAR(191) NOT NULL,
    `contactPersonEmail` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `StartDate` DATETIME(3) NOT NULL,
    `EndDate` DATETIME(3) NOT NULL,
    `CreationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `CreatedBy` VARCHAR(191) NOT NULL,
    `RevisionDate` DATETIME(3) NOT NULL,
    `RevisedBy` VARCHAR(191) NOT NULL,
    `Status` INTEGER NOT NULL DEFAULT 0,
    `IsProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `StartDate` DATETIME(3) NOT NULL,
    `EndDate` DATETIME(3) NOT NULL,
    `CreationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `CreatedBy` VARCHAR(191) NOT NULL,
    `RevisionDate` DATETIME(3) NOT NULL,
    `RevisedBy` VARCHAR(191) NOT NULL,
    `Status` INTEGER NOT NULL DEFAULT 0,
    `IsProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evaluation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `StartDate` DATETIME(3) NOT NULL,
    `EndDate` DATETIME(3) NOT NULL,
    `CreationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `CreatedBy` VARCHAR(191) NOT NULL,
    `RevisionDate` DATETIME(3) NOT NULL,
    `RevisedBy` VARCHAR(191) NOT NULL,
    `Status` INTEGER NOT NULL DEFAULT 0,
    `IsProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instruction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `StartDate` DATETIME(3) NOT NULL,
    `EndDate` DATETIME(3) NOT NULL,
    `CreationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `CreatedBy` VARCHAR(191) NOT NULL,
    `RevisionDate` DATETIME(3) NOT NULL,
    `RevisedBy` VARCHAR(191) NOT NULL,
    `Status` INTEGER NOT NULL DEFAULT 0,
    `IsProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `manpower` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `StartDate` DATETIME(3) NOT NULL,
    `EndDate` DATETIME(3) NOT NULL,
    `CreationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `CreatedBy` VARCHAR(191) NOT NULL,
    `RevisionDate` DATETIME(3) NOT NULL,
    `RevisedBy` VARCHAR(191) NOT NULL,
    `Status` INTEGER NOT NULL DEFAULT 0,
    `IsProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `material_category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `StartDate` DATETIME(3) NOT NULL,
    `EndDate` DATETIME(3) NOT NULL,
    `CreationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `CreatedBy` VARCHAR(191) NOT NULL,
    `RevisionDate` DATETIME(3) NOT NULL,
    `RevisedBy` VARCHAR(191) NOT NULL,
    `Status` INTEGER NOT NULL DEFAULT 0,
    `IsProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `material` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `unit` VARCHAR(191) NOT NULL,
    `material_category_id` INTEGER NOT NULL,
    `StartDate` DATETIME(3) NOT NULL,
    `EndDate` DATETIME(3) NOT NULL,
    `CreationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `CreatedBy` VARCHAR(191) NOT NULL,
    `RevisionDate` DATETIME(3) NOT NULL,
    `RevisedBy` VARCHAR(191) NOT NULL,
    `Status` INTEGER NOT NULL DEFAULT 0,
    `IsProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `phase` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `StartDate` DATETIME(3) NOT NULL,
    `EndDate` DATETIME(3) NOT NULL,
    `CreationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `CreatedBy` VARCHAR(191) NOT NULL,
    `RevisionDate` DATETIME(3) NOT NULL,
    `RevisedBy` VARCHAR(191) NOT NULL,
    `Status` INTEGER NOT NULL DEFAULT 0,
    `IsProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `priority` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `StartDate` DATETIME(3) NOT NULL,
    `EndDate` DATETIME(3) NOT NULL,
    `CreationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `CreatedBy` VARCHAR(191) NOT NULL,
    `RevisionDate` DATETIME(3) NOT NULL,
    `RevisedBy` VARCHAR(191) NOT NULL,
    `Status` INTEGER NOT NULL DEFAULT 0,
    `IsProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `StartDate` DATETIME(3) NOT NULL,
    `EndDate` DATETIME(3) NOT NULL,
    `CreationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `CreatedBy` VARCHAR(191) NOT NULL,
    `RevisionDate` DATETIME(3) NOT NULL,
    `RevisedBy` VARCHAR(191) NOT NULL,
    `Status` INTEGER NOT NULL DEFAULT 0,
    `IsProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `material` ADD CONSTRAINT `material_material_category_id_fkey` FOREIGN KEY (`material_category_id`) REFERENCES `material_category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
