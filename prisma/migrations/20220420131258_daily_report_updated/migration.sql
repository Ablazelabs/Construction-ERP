/*
  Warnings:

  - Added the required column `employee_id` to the `daily_report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `daily_report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `daily_report` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `daily_report` ADD COLUMN `employee_id` INTEGER NOT NULL,
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    MODIFY `material_delivered` VARCHAR(1200) NULL,
    MODIFY `available_machine_on_site` VARCHAR(1200) NULL,
    MODIFY `problem_encountered` VARCHAR(1200) NULL,
    MODIFY `no_of_labours` VARCHAR(1200) NULL;

-- AlterTable
ALTER TABLE `todos` ADD COLUMN `daily_report_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `todos` ADD CONSTRAINT `todos_daily_report_id_fkey` FOREIGN KEY (`daily_report_id`) REFERENCES `daily_report`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_report` ADD CONSTRAINT `daily_report_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
