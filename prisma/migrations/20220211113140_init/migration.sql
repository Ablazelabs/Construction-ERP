-- AddForeignKey
ALTER TABLE `cash_payment_voucher` ADD CONSTRAINT `cash_payment_voucher_prepared_by_id_fkey` FOREIGN KEY (`prepared_by_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `petty_cash` ADD CONSTRAINT `petty_cash_issued_by_id_fkey` FOREIGN KEY (`issued_by_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `petty_cash` ADD CONSTRAINT `petty_cash_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
