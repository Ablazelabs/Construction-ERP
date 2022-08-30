-- AlterTable
ALTER TABLE `todos` ADD COLUMN `quantity` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `total_area` DOUBLE NOT NULL DEFAULT 1,
    ADD COLUMN `total_price` DOUBLE NOT NULL DEFAULT 1,
    ADD COLUMN `unit_price` DOUBLE NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE `project_participation_request` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `requester_id` INTEGER NOT NULL,
    `project_id` INTEGER NOT NULL,
    `approval_status` INTEGER NOT NULL DEFAULT 1,
    `remark` VARCHAR(191) NULL,
    `requested_date` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `project_participation_request` ADD CONSTRAINT `project_participation_request_requester_id_fkey` FOREIGN KEY (`requester_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_participation_request` ADD CONSTRAINT `project_participation_request_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
