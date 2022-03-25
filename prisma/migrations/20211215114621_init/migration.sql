/*
  Warnings:

  - A unique constraint covering the columns `[account_code]` on the table `chart_of_account` will be added. If there are existing duplicate values, this will fail.
  - Made the column `account_name` on table `chart_of_account` required. This step will fail if there are existing NULL values in that column.
  - Made the column `account_code` on table `chart_of_account` required. This step will fail if there are existing NULL values in that column.
  - Made the column `chart_of_account_id` on table `cost_center_accounts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cost_center_id` on table `cost_center_accounts` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `chart_of_account` DROP FOREIGN KEY `chart_of_account_currency_id_fkey`;

-- DropForeignKey
ALTER TABLE `cost_center_accounts` DROP FOREIGN KEY `cost_center_accounts_chart_of_account_id_fkey`;

-- DropForeignKey
ALTER TABLE `cost_center_accounts` DROP FOREIGN KEY `cost_center_accounts_cost_center_id_fkey`;

-- AlterTable
ALTER TABLE `chart_of_account` MODIFY `account_name` VARCHAR(191) NOT NULL,
    MODIFY `account_code` VARCHAR(191) NOT NULL,
    MODIFY `currency_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `cost_center_accounts` MODIFY `remark` VARCHAR(191) NULL,
    MODIFY `chart_of_account_id` INTEGER NOT NULL,
    MODIFY `cost_center_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `account_type_financial_statement_section` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `account_type_id` INTEGER NOT NULL,
    `financial_statement_section_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bank_reconcilation` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `from_date` DATETIME(3) NULL,
    `to_date` DATETIME(3) NULL,
    `closing_amount` DOUBLE NULL,
    `chart_of_account_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chart_of_account_files` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `path` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `type` VARCHAR(191) NULL,
    `chart_of_account_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estimated_total_production_unit` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `unit_name` VARCHAR(191) NOT NULL,
    `unit_symbol` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recurring_journal_occurrence` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `repeat_every_number` INTEGER NULL,
    `repeat_every_label` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `budget` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `fiscal_year` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `budget_reason` INTEGER NOT NULL,
    `project_name` VARCHAR(191) NULL,
    `cost_center_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `budget_account` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `budget_total_amount` DOUBLE NOT NULL,
    `budget_id` INTEGER NULL,
    `chart_of_account_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `budget_account_period` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `budget_amount` DOUBLE NOT NULL,
    `period_month` INTEGER NOT NULL,
    `budget_account_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `budget_control_action` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` INTEGER NOT NULL,
    `action_accumulated_monthly_budget_exceeded` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `general_journal_header` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `journal_date` DATETIME(3) NOT NULL,
    `posting_reference` VARCHAR(191) NOT NULL,
    `reference_number` VARCHAR(191) NULL,
    `journal_status` INTEGER NULL,
    `notes` VARCHAR(191) NOT NULL,
    `report_basis` INTEGER NULL,
    `journal_source` INTEGER NULL,
    `journal_posting_status` INTEGER NULL,
    `journal_type_reference` VARCHAR(191) NULL,
    `total_amount` DOUBLE NULL,
    `journal_type_id` INTEGER NULL,
    `recurring_general_journal_id` INTEGER NULL,
    `currency_id` INTEGER NOT NULL,
    `posting_responsible_user_id` INTEGER NOT NULL,

    UNIQUE INDEX `general_journal_header_posting_reference_key`(`posting_reference`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `general_ledger` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount_credit` DOUBLE NULL,
    `amount_debit` DOUBLE NULL,
    `ledger_status` INTEGER NULL,
    `posting_reference` VARCHAR(191) NOT NULL,
    `group_posting_reference` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `journal_date` DATETIME(3) NOT NULL,
    `posting_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `currency_id` INTEGER NOT NULL,
    `tax_id` INTEGER NULL,
    `tax_group_id` INTEGER NULL,
    `general_journal_header_id` INTEGER NULL,
    `chart_of_account_id` INTEGER NOT NULL,

    UNIQUE INDEX `general_ledger_posting_reference_key`(`posting_reference`),
    UNIQUE INDEX `general_ledger_group_posting_reference_key`(`group_posting_reference`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `journal_comment` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `commented_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `comment` VARCHAR(191) NOT NULL,
    `application_user_id` INTEGER NOT NULL,
    `contact_id` INTEGER NULL,
    `general_journal_header_id` INTEGER NULL,
    `recurring_general_journal_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `number_tracker` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `prefix` VARCHAR(191) NULL,
    `starting_number` INTEGER NOT NULL,
    `next_number` INTEGER NOT NULL,
    `reason` INTEGER NULL,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaction_lock` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lock_date` DATETIME(3) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `enable_transaction_locking` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `opening_balance` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `opening_balance_date` DATETIME(3) NOT NULL,
    `price_precision` INTEGER NULL,
    `amount` DOUBLE NULL,
    `month` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reconcilation_transaction` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bank_reconcilation_id` INTEGER NOT NULL,
    `general_ledger_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asset` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `tag_number` VARCHAR(191) NOT NULL,
    `acquisition_date` DATETIME(3) NULL,
    `description` VARCHAR(191) NOT NULL,
    `economic_value` DOUBLE NOT NULL,
    `depreciation_methods` INTEGER NOT NULL,
    `useful_life` DATETIME(3) NOT NULL,
    `current_value` DOUBLE NOT NULL,
    `asset_type` INTEGER NOT NULL,
    `asset_status` INTEGER NULL,
    `estimated_total_production` DOUBLE NULL,
    `scrap_value` DOUBLE NOT NULL,
    `estimated_total_production_unit_id` INTEGER NULL,
    `currency_id` INTEGER NOT NULL,
    `asset_account_id` INTEGER NOT NULL,
    `depreciation_account_id` INTEGER NOT NULL,
    `recurring_journal_occurrence_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `general_journal_detail` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(191) NULL,
    `debit_or_credit` INTEGER NOT NULL,
    `tax_group_id` INTEGER NULL,
    `amount_credit` DOUBLE NULL,
    `posting_reference` VARCHAR(191) NOT NULL,
    `reference_code` VARCHAR(191) NOT NULL,
    `amount_debit` DOUBLE NULL,
    `tax_id` INTEGER NULL,
    `contact_id` INTEGER NULL,
    `general_journal_header_id` INTEGER NOT NULL,
    `cost_center_id` INTEGER NOT NULL,
    `chart_of_account_id` INTEGER NOT NULL,

    UNIQUE INDEX `general_journal_detail_posting_reference_key`(`posting_reference`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `general_journal_files` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `path` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `type` VARCHAR(191) NULL,
    `general_journal_header_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recurring_general_journal` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `profile_name` VARCHAR(191) NOT NULL,
    `start_on` DATETIME(3) NULL,
    `end_on` DATETIME(3) NULL,
    `never_expires` BOOLEAN NULL,
    `depreciable_value` DOUBLE NULL,
    `recurring_general_journal_status` INTEGER NULL,
    `asset_id` INTEGER NULL,
    `recurring_journal_occurrence_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `chart_of_account_account_code_key` ON `chart_of_account`(`account_code`);

-- AddForeignKey
ALTER TABLE `cost_center_accounts` ADD CONSTRAINT `cost_center_accounts_cost_center_id_fkey` FOREIGN KEY (`cost_center_id`) REFERENCES `cost_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cost_center_accounts` ADD CONSTRAINT `cost_center_accounts_chart_of_account_id_fkey` FOREIGN KEY (`chart_of_account_id`) REFERENCES `chart_of_account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chart_of_account` ADD CONSTRAINT `chart_of_account_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currency`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `account_type_financial_statement_section` ADD CONSTRAINT `account_type_financial_statement_section_account_type_id_fkey` FOREIGN KEY (`account_type_id`) REFERENCES `account_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `account_type_financial_statement_section` ADD CONSTRAINT `account_type_financial_statement_section_financial_statemen_fkey` FOREIGN KEY (`financial_statement_section_id`) REFERENCES `financial_statement_section`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bank_reconcilation` ADD CONSTRAINT `bank_reconcilation_chart_of_account_id_fkey` FOREIGN KEY (`chart_of_account_id`) REFERENCES `chart_of_account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chart_of_account_files` ADD CONSTRAINT `chart_of_account_files_chart_of_account_id_fkey` FOREIGN KEY (`chart_of_account_id`) REFERENCES `chart_of_account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `budget` ADD CONSTRAINT `budget_cost_center_id_fkey` FOREIGN KEY (`cost_center_id`) REFERENCES `cost_center`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `budget_account` ADD CONSTRAINT `budget_account_budget_id_fkey` FOREIGN KEY (`budget_id`) REFERENCES `budget`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `budget_account` ADD CONSTRAINT `budget_account_chart_of_account_id_fkey` FOREIGN KEY (`chart_of_account_id`) REFERENCES `chart_of_account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `budget_account_period` ADD CONSTRAINT `budget_account_period_budget_account_id_fkey` FOREIGN KEY (`budget_account_id`) REFERENCES `budget_account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `general_journal_header` ADD CONSTRAINT `general_journal_header_journal_type_id_fkey` FOREIGN KEY (`journal_type_id`) REFERENCES `journal_type`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `general_journal_header` ADD CONSTRAINT `general_journal_header_recurring_general_journal_id_fkey` FOREIGN KEY (`recurring_general_journal_id`) REFERENCES `recurring_general_journal`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `general_journal_header` ADD CONSTRAINT `general_journal_header_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currency`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `general_journal_header` ADD CONSTRAINT `general_journal_header_posting_responsible_user_id_fkey` FOREIGN KEY (`posting_responsible_user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `general_ledger` ADD CONSTRAINT `general_ledger_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currency`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `general_ledger` ADD CONSTRAINT `general_ledger_tax_id_fkey` FOREIGN KEY (`tax_id`) REFERENCES `tax`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `general_ledger` ADD CONSTRAINT `general_ledger_tax_group_id_fkey` FOREIGN KEY (`tax_group_id`) REFERENCES `tax_group`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `general_ledger` ADD CONSTRAINT `general_ledger_general_journal_header_id_fkey` FOREIGN KEY (`general_journal_header_id`) REFERENCES `general_journal_header`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `general_ledger` ADD CONSTRAINT `general_ledger_chart_of_account_id_fkey` FOREIGN KEY (`chart_of_account_id`) REFERENCES `chart_of_account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `journal_comment` ADD CONSTRAINT `journal_comment_application_user_id_fkey` FOREIGN KEY (`application_user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `journal_comment` ADD CONSTRAINT `journal_comment_contact_id_fkey` FOREIGN KEY (`contact_id`) REFERENCES `contact`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `journal_comment` ADD CONSTRAINT `journal_comment_general_journal_header_id_fkey` FOREIGN KEY (`general_journal_header_id`) REFERENCES `general_journal_header`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `journal_comment` ADD CONSTRAINT `journal_comment_recurring_general_journal_id_fkey` FOREIGN KEY (`recurring_general_journal_id`) REFERENCES `recurring_general_journal`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reconcilation_transaction` ADD CONSTRAINT `reconcilation_transaction_general_ledger_id_fkey` FOREIGN KEY (`general_ledger_id`) REFERENCES `general_ledger`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reconcilation_transaction` ADD CONSTRAINT `reconcilation_transaction_bank_reconcilation_id_fkey` FOREIGN KEY (`bank_reconcilation_id`) REFERENCES `bank_reconcilation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset` ADD CONSTRAINT `asset_estimated_total_production_unit_id_fkey` FOREIGN KEY (`estimated_total_production_unit_id`) REFERENCES `estimated_total_production_unit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset` ADD CONSTRAINT `asset_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currency`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset` ADD CONSTRAINT `asset_depreciation_account_id_fkey` FOREIGN KEY (`depreciation_account_id`) REFERENCES `chart_of_account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset` ADD CONSTRAINT `asset_asset_account_id_fkey` FOREIGN KEY (`asset_account_id`) REFERENCES `chart_of_account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset` ADD CONSTRAINT `asset_recurring_journal_occurrence_id_fkey` FOREIGN KEY (`recurring_journal_occurrence_id`) REFERENCES `recurring_journal_occurrence`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `general_journal_detail` ADD CONSTRAINT `general_journal_detail_tax_id_fkey` FOREIGN KEY (`tax_id`) REFERENCES `tax`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `general_journal_detail` ADD CONSTRAINT `general_journal_detail_contact_id_fkey` FOREIGN KEY (`contact_id`) REFERENCES `contact`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `general_journal_detail` ADD CONSTRAINT `general_journal_detail_general_journal_header_id_fkey` FOREIGN KEY (`general_journal_header_id`) REFERENCES `general_journal_header`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `general_journal_detail` ADD CONSTRAINT `general_journal_detail_cost_center_id_fkey` FOREIGN KEY (`cost_center_id`) REFERENCES `cost_center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `general_journal_detail` ADD CONSTRAINT `general_journal_detail_chart_of_account_id_fkey` FOREIGN KEY (`chart_of_account_id`) REFERENCES `chart_of_account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `general_journal_files` ADD CONSTRAINT `general_journal_files_general_journal_header_id_fkey` FOREIGN KEY (`general_journal_header_id`) REFERENCES `general_journal_header`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recurring_general_journal` ADD CONSTRAINT `recurring_general_journal_asset_id_fkey` FOREIGN KEY (`asset_id`) REFERENCES `asset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recurring_general_journal` ADD CONSTRAINT `recurring_general_journal_recurring_journal_occurrence_id_fkey` FOREIGN KEY (`recurring_journal_occurrence_id`) REFERENCES `recurring_journal_occurrence`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
