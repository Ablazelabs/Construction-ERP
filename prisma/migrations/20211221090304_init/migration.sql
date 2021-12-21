-- CreateTable
CREATE TABLE `job_safety_equipment` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `safety_equipment_id` INTEGER NOT NULL,
    `job_title_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `safety_equipment` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `company` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `country_id` INTEGER NULL,
    `currency_id` INTEGER NULL,
    `logo` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `company_primary_contact` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `location_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `external_applicant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `applicant_name` VARCHAR(191) NOT NULL,
    `father_name` VARCHAR(191) NOT NULL,
    `grand_father_name` VARCHAR(191) NULL,
    `mobile_number` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `experience_year` INTEGER NULL,
    `gender` INTEGER NOT NULL,
    `marital_status` INTEGER NULL,
    `file` VARCHAR(191) NULL,
    `name` VARCHAR(191) NULL,
    `type` VARCHAR(191) NULL,
    `training_type_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vacancy` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `number_of_position` INTEGER NOT NULL,
    `vacancy_status` INTEGER NOT NULL,
    `opening_date` DATETIME(3) NULL,
    `closing_date` DATETIME(3) NULL,
    `action_date` DATETIME(3) NULL,
    `vacancy_type` INTEGER NOT NULL,
    `requested_by` VARCHAR(191) NULL,
    `approved_by` VARCHAR(191) NULL,
    `remark` VARCHAR(191) NULL,
    `job_title_id` INTEGER NOT NULL,
    `vacancy_request_reason_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vacancy_applicant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `application_date` DATETIME(3) NOT NULL,
    `remark` VARCHAR(191) NULL,
    `scale` DOUBLE NULL,
    `result` DOUBLE NULL,
    `application_status` INTEGER NOT NULL,
    `is_employee` INTEGER NOT NULL,
    `external_applicant_id` INTEGER NULL,
    `employee_id` INTEGER NULL,
    `vacancy_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vacancy_examiner` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vacancy_id` INTEGER NOT NULL,
    `employee_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vacancy_internal_applicant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employee_id` INTEGER NOT NULL,
    `vacancy_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vacancy_request_reason` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reason` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `job_safety_equipment` ADD CONSTRAINT `job_safety_equipment_job_title_id_fkey` FOREIGN KEY (`job_title_id`) REFERENCES `job_title`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_safety_equipment` ADD CONSTRAINT `job_safety_equipment_safety_equipment_id_fkey` FOREIGN KEY (`safety_equipment_id`) REFERENCES `safety_equipment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `company` ADD CONSTRAINT `company_country_id_fkey` FOREIGN KEY (`country_id`) REFERENCES `country`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `company` ADD CONSTRAINT `company_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currency`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `company_primary_contact` ADD CONSTRAINT `company_primary_contact_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `external_applicant` ADD CONSTRAINT `external_applicant_training_type_id_fkey` FOREIGN KEY (`training_type_id`) REFERENCES `training_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vacancy` ADD CONSTRAINT `vacancy_job_title_id_fkey` FOREIGN KEY (`job_title_id`) REFERENCES `job_title`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vacancy` ADD CONSTRAINT `vacancy_vacancy_request_reason_id_fkey` FOREIGN KEY (`vacancy_request_reason_id`) REFERENCES `vacancy_request_reason`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vacancy_applicant` ADD CONSTRAINT `vacancy_applicant_external_applicant_id_fkey` FOREIGN KEY (`external_applicant_id`) REFERENCES `external_applicant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vacancy_applicant` ADD CONSTRAINT `vacancy_applicant_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vacancy_applicant` ADD CONSTRAINT `vacancy_applicant_vacancy_id_fkey` FOREIGN KEY (`vacancy_id`) REFERENCES `vacancy`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vacancy_examiner` ADD CONSTRAINT `vacancy_examiner_vacancy_id_fkey` FOREIGN KEY (`vacancy_id`) REFERENCES `vacancy`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vacancy_examiner` ADD CONSTRAINT `vacancy_examiner_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vacancy_internal_applicant` ADD CONSTRAINT `vacancy_internal_applicant_vacancy_id_fkey` FOREIGN KEY (`vacancy_id`) REFERENCES `vacancy`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vacancy_internal_applicant` ADD CONSTRAINT `vacancy_internal_applicant_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
