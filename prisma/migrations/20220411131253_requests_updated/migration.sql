/*
  Warnings:

  - Made the column `approval_status` on table `request_payment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `manpower_requirement` ADD COLUMN `approval_status` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `request` ADD COLUMN `approval_status` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `request_payment` MODIFY `approval_status` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `required_document` ADD COLUMN `approval_status` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `required_equipment` ADD COLUMN `approval_status` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `required_material` ADD COLUMN `approval_status` INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE `project_edit_request` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `requester_id` INTEGER NOT NULL,
    `approval_status` INTEGER NOT NULL DEFAULT 1,
    `requested_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `project_edit_request` ADD CONSTRAINT `project_edit_request_requester_id_fkey` FOREIGN KEY (`requester_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
