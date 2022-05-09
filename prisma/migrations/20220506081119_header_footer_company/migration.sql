-- AlterTable
ALTER TABLE `company` ADD COLUMN `footer` VARCHAR(191) NULL,
    ADD COLUMN `header` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `employee_action` MODIFY `employee_status` INTEGER NULL DEFAULT 1;
