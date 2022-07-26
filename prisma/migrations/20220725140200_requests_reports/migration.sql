/*
  Warnings:

  - You are about to drop the column `employee_id` on the `daily_report` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `daily_report` DROP FOREIGN KEY `daily_report_employee_id_fkey`;

-- AlterTable
ALTER TABLE `daily_report` DROP COLUMN `employee_id`,
    ADD COLUMN `prepared_by_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `_daily_report_involvement` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_daily_report_involvement_AB_unique`(`A`, `B`),
    INDEX `_daily_report_involvement_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `daily_report` ADD CONSTRAINT `daily_report_prepared_by_id_fkey` FOREIGN KEY (`prepared_by_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_daily_report_involvement` ADD CONSTRAINT `_daily_report_involvement_A_fkey` FOREIGN KEY (`A`) REFERENCES `daily_report`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_daily_report_involvement` ADD CONSTRAINT `_daily_report_involvement_B_fkey` FOREIGN KEY (`B`) REFERENCES `employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
