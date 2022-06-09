/*
  Warnings:

  - You are about to drop the column `approval_status` on the `manpower_requirement` table. All the data in the column will be lost.
  - You are about to drop the column `approval_status` on the `required_document` table. All the data in the column will be lost.
  - You are about to drop the column `approval_status` on the `required_equipment` table. All the data in the column will be lost.
  - You are about to drop the column `approval_status` on the `required_material` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `manpower_requirement` DROP COLUMN `approval_status`;

-- AlterTable
ALTER TABLE `required_document` DROP COLUMN `approval_status`;

-- AlterTable
ALTER TABLE `required_equipment` DROP COLUMN `approval_status`;

-- AlterTable
ALTER TABLE `required_material` DROP COLUMN `approval_status`;

-- CreateTable
CREATE TABLE `project_request` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `request_type` INTEGER NOT NULL,
    `priority` INTEGER NOT NULL,
    `total_amount` DOUBLE NULL,
    `vat_amount` DOUBLE NULL,
    `sub_total` DOUBLE NULL,
    `prepared_by_id` INTEGER NOT NULL,
    `checked_by_id` INTEGER NULL,
    `approved_by_id` INTEGER NULL,
    `approval_status` INTEGER NOT NULL,
    `requested_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `action_taken_date` DATETIME(3) NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `project_id` INTEGER NOT NULL,
    `action_note` VARCHAR(191) NULL,
    `remark` VARCHAR(1000) NULL,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `individual_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `persons` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `returnable` BOOLEAN NULL,
    `return_date` DATETIME(3) NULL,
    `quantity` INTEGER NOT NULL,
    `quantity_type` VARCHAR(191) NULL,
    `unit_rate` DOUBLE NULL,
    `vat` BOOLEAN NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `project_request_id` INTEGER NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `project_request` ADD CONSTRAINT `project_request_prepared_by_id_fkey` FOREIGN KEY (`prepared_by_id`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_request` ADD CONSTRAINT `project_request_checked_by_id_fkey` FOREIGN KEY (`checked_by_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_request` ADD CONSTRAINT `project_request_approved_by_id_fkey` FOREIGN KEY (`approved_by_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_request` ADD CONSTRAINT `project_request_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `individual_requests` ADD CONSTRAINT `individual_requests_project_request_id_fkey` FOREIGN KEY (`project_request_id`) REFERENCES `project_request`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
