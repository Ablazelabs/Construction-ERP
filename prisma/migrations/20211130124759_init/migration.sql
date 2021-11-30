-- AlterTable
ALTER TABLE `privilege` ADD COLUMN `concurrency_stamp` VARCHAR(191) NOT NULL DEFAULT 'random';
