-- AlterTable
ALTER TABLE `todos` ADD COLUMN `daily_work_log_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `daily_report` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `activities_performed` VARCHAR(1200) NOT NULL,
    `material_delivered` VARCHAR(1200) NOT NULL,
    `available_machine_on_site` VARCHAR(1200) NOT NULL,
    `problem_encountered` VARCHAR(1200) NOT NULL,
    `no_of_labours` VARCHAR(1200) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `project_id` INTEGER NOT NULL,
    `remark` VARCHAR(1000) NULL,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `todos` ADD CONSTRAINT `todos_daily_work_log_id_fkey` FOREIGN KEY (`daily_work_log_id`) REFERENCES `daily_work_log`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_report` ADD CONSTRAINT `daily_report_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
