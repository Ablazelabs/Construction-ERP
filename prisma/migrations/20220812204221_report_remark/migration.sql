-- AlterTable
ALTER TABLE `project_edit_request` ADD COLUMN `reason` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `project_request` ADD COLUMN `checker_action_note` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `report_remarks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `revisionDate` DATETIME(3) NOT NULL,
    `remark_written_by_id` INTEGER NOT NULL,
    `remark` VARCHAR(500) NOT NULL,
    `daily_report_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `report_remarks` ADD CONSTRAINT `report_remarks_daily_report_id_fkey` FOREIGN KEY (`daily_report_id`) REFERENCES `daily_report`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_remarks` ADD CONSTRAINT `report_remarks_remark_written_by_id_fkey` FOREIGN KEY (`remark_written_by_id`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
