-- CreateTable
CREATE TABLE `announcement` (
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
    `start_timme` DATETIME(3) NULL,
    `end_time` DATETIME(3) NULL,
    `description` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `all_employees` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_announcementToemployee` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_announcementToemployee_AB_unique`(`A`, `B`),
    INDEX `_announcementToemployee_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_announcementTobusiness_unit` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_announcementTobusiness_unit_AB_unique`(`A`, `B`),
    INDEX `_announcementTobusiness_unit_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_announcementTojob_title` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_announcementTojob_title_AB_unique`(`A`, `B`),
    INDEX `_announcementTojob_title_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_announcementToemployee` ADD FOREIGN KEY (`A`) REFERENCES `announcement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_announcementToemployee` ADD FOREIGN KEY (`B`) REFERENCES `employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_announcementTobusiness_unit` ADD FOREIGN KEY (`A`) REFERENCES `announcement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_announcementTobusiness_unit` ADD FOREIGN KEY (`B`) REFERENCES `business_unit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_announcementTojob_title` ADD FOREIGN KEY (`A`) REFERENCES `announcement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_announcementTojob_title` ADD FOREIGN KEY (`B`) REFERENCES `job_title`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
