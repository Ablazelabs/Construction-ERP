-- DropIndex
DROP INDEX `general_ledger_group_posting_reference_key` ON `general_ledger`;

-- AddForeignKey
ALTER TABLE `hcm_configuration` ADD CONSTRAINT `hcm_configuration_income_tax_payable_id_fkey` FOREIGN KEY (`income_tax_payable_id`) REFERENCES `chart_of_account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hcm_configuration` ADD CONSTRAINT `hcm_configuration_employer_tax_id_fkey` FOREIGN KEY (`employer_tax_id`) REFERENCES `chart_of_account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hcm_configuration` ADD CONSTRAINT `hcm_configuration_employer_tax_control_id_fkey` FOREIGN KEY (`employer_tax_control_id`) REFERENCES `chart_of_account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hcm_configuration` ADD CONSTRAINT `hcm_configuration_employer_pension_account_id_fkey` FOREIGN KEY (`employer_pension_account_id`) REFERENCES `chart_of_account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
