/*
  Warnings:

  - Added the required column `project_id` to the `project_edit_request` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `individual_requests` MODIFY `persons` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `project_edit_request` ADD COLUMN `project_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `project_request` ADD COLUMN `invoice` VARCHAR(3000) NULL;

-- AddForeignKey
ALTER TABLE `project_edit_request` ADD CONSTRAINT `project_edit_request_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
