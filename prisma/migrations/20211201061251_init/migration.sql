-- AlterTable
ALTER TABLE `privilege` ADD COLUMN `deleted_status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `role` ADD COLUMN `deleted_status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `deleted_status` INTEGER NOT NULL DEFAULT 0;
