-- AlterTable
ALTER TABLE `sub_task` ADD COLUMN `progress` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `task_manager` ADD COLUMN `progress` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `employee_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
