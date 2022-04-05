-- AlterTable
ALTER TABLE `task_manager` ADD COLUMN `dependency_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `task_manager` ADD CONSTRAINT `task_manager_dependency_id_fkey` FOREIGN KEY (`dependency_id`) REFERENCES `task_manager`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
