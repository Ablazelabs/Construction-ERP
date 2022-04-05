/*
  Warnings:

  - You are about to alter the column `task_start_date` on the `task_manager` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - You are about to alter the column `task_end_date` on the `task_manager` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.

*/
-- AlterTable
ALTER TABLE `manpower_requirement` ADD COLUMN `task_manager_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `required_equipment` ADD COLUMN `task_manager_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `required_material` ADD COLUMN `task_manager_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `task_manager` MODIFY `task_start_date` DATETIME(3) NOT NULL,
    MODIFY `task_end_date` DATETIME(3) NULL;

-- AddForeignKey
ALTER TABLE `manpower_requirement` ADD CONSTRAINT `manpower_requirement_task_manager_id_fkey` FOREIGN KEY (`task_manager_id`) REFERENCES `task_manager`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `required_equipment` ADD CONSTRAINT `required_equipment_task_manager_id_fkey` FOREIGN KEY (`task_manager_id`) REFERENCES `task_manager`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `required_material` ADD CONSTRAINT `required_material_task_manager_id_fkey` FOREIGN KEY (`task_manager_id`) REFERENCES `task_manager`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
