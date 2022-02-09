-- AlterTable
ALTER TABLE `budget_control_action` ADD COLUMN `budget_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `budget_control_action` ADD CONSTRAINT `budget_control_action_budget_id_fkey` FOREIGN KEY (`budget_id`) REFERENCES `budget`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
