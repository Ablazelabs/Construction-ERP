-- CreateTable
CREATE TABLE `export_template` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `template_name` VARCHAR(191) NOT NULL,
    `module_name` INTEGER NOT NULL,
    `export_template_fields` VARCHAR(191) NOT NULL,
    `excel_columns` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `export_template_template_name_key`(`template_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
