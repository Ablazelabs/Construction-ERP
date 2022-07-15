-- CreateTable
CREATE TABLE `pv_edit_request` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `requester_id` INTEGER NOT NULL,
    `approval_status` INTEGER NOT NULL DEFAULT 1,
    `requested_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `payment_request_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sales_data` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name_of_company` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone_number` VARCHAR(191) NULL,
    `street_name` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `region` VARCHAR(191) NULL,
    `other_profile_text` VARCHAR(191) NULL,
    `other_glass_text` VARCHAR(191) NULL,
    `other_aluminum_text` VARCHAR(191) NULL,
    `quantity_remark` VARCHAR(191) NULL,
    `ltz_profile` BOOLEAN NOT NULL DEFAULT false,
    `curtain_profile` BOOLEAN NOT NULL DEFAULT false,
    `fasha_zocolo` BOOLEAN NOT NULL DEFAULT false,
    `oval_flat_ferma` BOOLEAN NOT NULL DEFAULT false,
    `sliding_cup` BOOLEAN NOT NULL DEFAULT false,
    `pressure_plate` BOOLEAN NOT NULL DEFAULT false,
    `RHS` BOOLEAN NOT NULL DEFAULT false,
    `external_internal_profile` BOOLEAN NOT NULL DEFAULT false,
    `clear` BOOLEAN NOT NULL DEFAULT false,
    `reflective` BOOLEAN NOT NULL DEFAULT false,
    `tinted` BOOLEAN NOT NULL DEFAULT false,
    `tempered` BOOLEAN NOT NULL DEFAULT false,
    `laminated` BOOLEAN NOT NULL DEFAULT false,
    `silver` BOOLEAN NOT NULL DEFAULT false,
    `coffee` BOOLEAN NOT NULL DEFAULT false,
    `black` BOOLEAN NOT NULL DEFAULT false,
    `grey` BOOLEAN NOT NULL DEFAULT false,
    `ivory` BOOLEAN NOT NULL DEFAULT false,
    `isContacted` BOOLEAN NOT NULL DEFAULT false,
    `sales_rep_id` INTEGER NULL,
    `contact_handler_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pv_edit_request` ADD CONSTRAINT `pv_edit_request_payment_request_id_fkey` FOREIGN KEY (`payment_request_id`) REFERENCES `payment_request`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pv_edit_request` ADD CONSTRAINT `pv_edit_request_requester_id_fkey` FOREIGN KEY (`requester_id`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sales_data` ADD CONSTRAINT `sales_data_sales_rep_id_fkey` FOREIGN KEY (`sales_rep_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sales_data` ADD CONSTRAINT `sales_data_contact_handler_id_fkey` FOREIGN KEY (`contact_handler_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
