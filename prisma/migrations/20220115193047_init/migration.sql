/*
  Warnings:

  - You are about to drop the `holiday_character` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `holiday_character` DROP FOREIGN KEY `holiday_character_holiday_id_fkey`;

-- AlterTable
ALTER TABLE `attendance_abscence_type` ADD COLUMN `is_absence_includes_day_off` BOOLEAN NULL,
    ADD COLUMN `number_of_increment_each_year` DOUBLE NULL;

-- DropTable
DROP TABLE `holiday_character`;

-- CreateTable
CREATE TABLE `holiday_calendar` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `is_half_day` BOOLEAN NULL,
    `holiday_id` INTEGER NOT NULL,

    UNIQUE INDEX `holiday_calendar_date_key`(`date`),
    UNIQUE INDEX `holiday_calendar_holiday_id_key`(`holiday_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `holiday_calendar` ADD CONSTRAINT `holiday_calendar_holiday_id_fkey` FOREIGN KEY (`holiday_id`) REFERENCES `holiday`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
