-- AddForeignKey
ALTER TABLE `general_journal_detail` ADD CONSTRAINT `general_journal_detail_tax_group_id_fkey` FOREIGN KEY (`tax_group_id`) REFERENCES `tax_group`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
