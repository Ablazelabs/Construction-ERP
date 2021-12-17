/*
  Warnings:

  - A unique constraint covering the columns `[currency_code]` on the table `currency` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[symbol]` on the table `currency` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `general_journal_detail` DROP FOREIGN KEY `general_journal_detail_cost_center_id_fkey`;

-- AlterTable
ALTER TABLE `general_journal_detail` MODIFY `reference_code` VARCHAR(191) NULL,
    MODIFY `cost_center_id` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `currency_currency_code_key` ON `currency`(`currency_code`);

-- CreateIndex
CREATE UNIQUE INDEX `currency_symbol_key` ON `currency`(`symbol`);

-- AddForeignKey
ALTER TABLE `general_journal_detail` ADD CONSTRAINT `general_journal_detail_cost_center_id_fkey` FOREIGN KEY (`cost_center_id`) REFERENCES `cost_center`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
