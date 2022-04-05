/*
  Warnings:

  - You are about to drop the column `dupty_manager` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `project_manager` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `site_engineer` on the `project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `project` DROP COLUMN `dupty_manager`,
    DROP COLUMN `project_manager`,
    DROP COLUMN `site_engineer`,
    ADD COLUMN `dupty_manager_id` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `project_manager_id` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `site_engineer_id` INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE `project` ADD CONSTRAINT `project_site_engineer_id_fkey` FOREIGN KEY (`site_engineer_id`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project` ADD CONSTRAINT `project_dupty_manager_id_fkey` FOREIGN KEY (`dupty_manager_id`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project` ADD CONSTRAINT `project_project_manager_id_fkey` FOREIGN KEY (`project_manager_id`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
