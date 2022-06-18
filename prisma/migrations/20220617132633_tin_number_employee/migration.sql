-- DropIndex
DROP INDEX `currency_symbol_key` ON `currency`;

-- AlterTable
ALTER TABLE `employee` ADD COLUMN `tin_number` VARCHAR(191) NULL;
