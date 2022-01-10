/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `account_category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `account_type` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[account_name]` on the table `bank` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `financial_statement_section` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `tax_authority` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tax_exemption_reason]` on the table `tax_exemption` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tax_group_name]` on the table `tax_group` will be added. If there are existing duplicate values, this will fail.
  - Made the column `note` on table `closing_note` required. This step will fail if there are existing NULL values in that column.
  - Made the column `city` on table `contact_address` required. This step will fail if there are existing NULL values in that column.
  - Made the column `remark` on table `cost_center_accounts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `access_name` on table `journal_users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `journal_users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `show_it_as` on table `payment_term` required. This step will fail if there are existing NULL values in that column.
  - Made the column `number_of_days` on table `payment_term` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tax_exemption_reason` on table `tax_exemption` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `journal_users` DROP FOREIGN KEY `journal_users_user_id_fkey`;

-- AlterTable
ALTER TABLE `account_category` ADD COLUMN `name` VARCHAR(191) NOT NULL DEFAULT 'random';

-- AlterTable
ALTER TABLE `closing_note` MODIFY `closing_type` INTEGER NULL,
    MODIFY `title` VARCHAR(191) NULL,
    MODIFY `note` VARCHAR(191) NOT NULL,
    MODIFY `consideration` INTEGER NULL;

-- AlterTable
ALTER TABLE `contact_address` MODIFY `city` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `cost_center_accounts` MODIFY `remark` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `journal_users` MODIFY `access_name` INTEGER NOT NULL,
    MODIFY `user_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `payment_term` MODIFY `show_it_as` VARCHAR(191) NOT NULL,
    MODIFY `number_of_days` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `tax_exemption` MODIFY `tax_exemption_reason` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `account_category_name_key` ON `account_category`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `account_type_code_key` ON `account_type`(`code`);

-- CreateIndex
CREATE UNIQUE INDEX `bank_account_name_key` ON `bank`(`account_name`);

-- CreateIndex
CREATE UNIQUE INDEX `financial_statement_section_name_key` ON `financial_statement_section`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `tax_authority_name_key` ON `tax_authority`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `tax_exemption_tax_exemption_reason_key` ON `tax_exemption`(`tax_exemption_reason`);

-- CreateIndex
CREATE UNIQUE INDEX `tax_group_tax_group_name_key` ON `tax_group`(`tax_group_name`);

-- AddForeignKey
ALTER TABLE `journal_users` ADD CONSTRAINT `journal_users_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
