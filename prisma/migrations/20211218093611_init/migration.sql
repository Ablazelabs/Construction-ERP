-- AlterTable
ALTER TABLE `hcm_configuration` MODIFY `employer_pension` DOUBLE NULL,
    MODIFY `employee_pension` DOUBLE NULL,
    MODIFY `employee_retirement_age` INTEGER NULL;

-- CreateTable
CREATE TABLE `salary_component` (
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
    `salary_component_type` INTEGER NULL,
    `value_type` INTEGER NOT NULL,
    `value` DOUBLE NULL,
    `taxable` BOOLEAN NULL,
    `chart_of_account_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payroll_frequency_type` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `payroll_frequency_desc` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paygrade` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `paygrade_name` VARCHAR(191) NOT NULL,
    `min_salary` DOUBLE NOT NULL,
    `max_salary` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendance_abscence_type` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aa_description` VARCHAR(191) NOT NULL,
    `is_with_quota` BOOLEAN NULL,
    `is_with_pay` BOOLEAN NULL,
    `is_annual_leave` BOOLEAN NULL,
    `is_with_entitlement` BOOLEAN NULL,
    `is_regular_attendance` BOOLEAN NULL,
    `number_of_days` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shift_schedule_hdr` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shift_name` VARCHAR(191) NOT NULL,
    `sub_shift_group_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sub_shift_group` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sub_shift_name` VARCHAR(191) NOT NULL,
    `morning_out` DOUBLE NOT NULL,
    `afternoon_in` DOUBLE NOT NULL,
    `tolerance_minutes` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_unit` (
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
    `parent_id` INTEGER NULL,
    `is_root` BOOLEAN NULL,
    `cost_center_id` INTEGER NULL,
    `employee_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `location` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `location_name` VARCHAR(191) NOT NULL,
    `address_1` VARCHAR(191) NOT NULL,
    `address_2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state_or_province` VARCHAR(191) NULL,
    `zip_or_portal_code` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `fax` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_title` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title_name` VARCHAR(191) NOT NULL,
    `job_specification` VARCHAR(191) NULL,
    `min_experience` INTEGER NULL,
    `paygrade_id` INTEGER NULL,
    `training_type_id` INTEGER NULL,
    `job_category_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_category` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category_description` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `address` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `address_line_1` VARCHAR(191) NOT NULL,
    `address_line_2` VARCHAR(191) NULL,
    `region` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `mobile_number` VARCHAR(191) NULL,
    `house_number` VARCHAR(191) NULL,
    `postal_box` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `employee_id` INTEGER NOT NULL,
    `address_type_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attachment` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(191) NULL,
    `type` VARCHAR(191) NULL,
    `name` VARCHAR(191) NULL,
    `size` INTEGER NULL,
    `path` VARCHAR(191) NOT NULL,
    `employee_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dependent` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullname` VARCHAR(191) NOT NULL,
    `relationship` INTEGER NULL,
    `dependent_date_of_birth` DATETIME(3) NULL,
    `employee_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `discipline` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `case_description` VARCHAR(191) NOT NULL,
    `attachment_id` INTEGER NULL,
    `case_type_id` INTEGER NULL,
    `employee_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `education` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `duration` INTEGER NOT NULL,
    `score` VARCHAR(191) NULL,
    `field_of_study_id` INTEGER NOT NULL,
    `duration_measure_id` INTEGER NOT NULL,
    `training_type_id` INTEGER NOT NULL,
    `employee_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_number` INTEGER NOT NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `middle_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NULL,
    `gender` INTEGER NOT NULL,
    `date_of_birth` DATETIME(3) NULL,
    `employment_start_date` DATETIME(3) NULL,
    `date_of_joining` DATETIME(3) NULL,
    `marital_status` INTEGER NULL,
    `marital_since` DATETIME(3) NULL,
    `place_of_birth` VARCHAR(191) NULL,
    `photo` VARCHAR(191) NULL,
    `is_employee_active` BOOLEAN NULL,
    `type` VARCHAR(191) NULL,
    `prev_employment_leave_days` DOUBLE NULL,
    `bank_account_number` VARCHAR(191) NULL,
    `document_ref` VARCHAR(191) NULL,
    `pension_ref` VARCHAR(191) NULL,
    `nationality_id` INTEGER NULL,
    `country_id` INTEGER NULL,
    `language_id` INTEGER NULL,
    `title_id` INTEGER NULL,
    `religion_id` INTEGER NULL,
    `employee_type_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_action` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employee_status` INTEGER NULL,
    `attachment_id` INTEGER NULL,
    `employee_id` INTEGER NOT NULL,
    `action_reason_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_attachment` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NULL,
    `employee_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_contact` (
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
    `relationship` VARCHAR(191) NOT NULL,
    `address_line_1` VARCHAR(191) NOT NULL,
    `address_line_2` VARCHAR(191) NULL,
    `mobile_number` VARCHAR(191) NOT NULL,
    `employee_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_id_range` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `start` INTEGER NOT NULL,
    `end` INTEGER NOT NULL,
    `number_of_digit` INTEGER NULL,
    `employee_type_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_loan_repayment` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `repayment_amount` DOUBLE NOT NULL,
    `total_amount` DOUBLE NOT NULL,
    `employee_id` INTEGER NULL,
    `salary_component_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_pay_frequency` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `expected_working_hrs` INTEGER NOT NULL,
    `employee_id` INTEGER NULL,
    `payroll_frequency_type_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_paygrade` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employee_id` INTEGER NOT NULL,
    `paygrade_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_salary_component` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` DOUBLE NULL,
    `employee_id` INTEGER NOT NULL,
    `salary_component_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `experience` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company` VARCHAR(191) NOT NULL,
    `job_title` VARCHAR(191) NOT NULL,
    `salary` DOUBLE NULL,
    `comment` VARCHAR(191) NULL,
    `employee_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leave_assignment` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `is_half_day` BOOLEAN NULL,
    `leave_assignment_type` INTEGER NULL,
    `leave_request_status` INTEGER NULL,
    `action_date` DATETIME(3) NULL,
    `delegated_user_name` VARCHAR(191) NULL,
    `employee_id` INTEGER NOT NULL,
    `attendance_abscence_type_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leave_entitlement` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employee_id` INTEGER NOT NULL,
    `attendance_abscence_type_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leave_transfer` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `from_year` INTEGER NULL,
    `to_year` INTEGER NULL,
    `number_of_days` INTEGER NULL,
    `leave_request_status` INTEGER NULL,
    `remark` VARCHAR(191) NOT NULL,
    `action_date` DATETIME(3) NULL,
    `delegated_user_name` VARCHAR(191) NULL,
    `employee_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `license` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `license_number` VARCHAR(191) NULL,
    `issued_date` DATETIME(3) NULL,
    `expiry_date` DATETIME(3) NOT NULL,
    `license_type_id` INTEGER NULL,
    `employee_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `org_assignment` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employee_group_id` INTEGER NULL,
    `location_id` INTEGER NULL,
    `employee_action_id` INTEGER NULL,
    `job_title_id` INTEGER NOT NULL,
    `business_unit_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_allowance_pay` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `allowance_pay` DOUBLE NOT NULL,
    `employee_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shift_assignment` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shift_schedule_hdr_id` INTEGER NOT NULL,
    `employee_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `salary_component` ADD CONSTRAINT `salary_component_chart_of_account_id_fkey` FOREIGN KEY (`chart_of_account_id`) REFERENCES `chart_of_account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shift_schedule_hdr` ADD CONSTRAINT `shift_schedule_hdr_sub_shift_group_id_fkey` FOREIGN KEY (`sub_shift_group_id`) REFERENCES `sub_shift_group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_unit` ADD CONSTRAINT `business_unit_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_unit` ADD CONSTRAINT `business_unit_cost_center_id_fkey` FOREIGN KEY (`cost_center_id`) REFERENCES `cost_center`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_title` ADD CONSTRAINT `job_title_paygrade_id_fkey` FOREIGN KEY (`paygrade_id`) REFERENCES `paygrade`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_title` ADD CONSTRAINT `job_title_training_type_id_fkey` FOREIGN KEY (`training_type_id`) REFERENCES `training_type`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_title` ADD CONSTRAINT `job_title_job_category_id_fkey` FOREIGN KEY (`job_category_id`) REFERENCES `job_category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `address` ADD CONSTRAINT `address_address_type_id_fkey` FOREIGN KEY (`address_type_id`) REFERENCES `address_type`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attachment` ADD CONSTRAINT `attachment_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dependent` ADD CONSTRAINT `dependent_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `discipline` ADD CONSTRAINT `discipline_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `discipline` ADD CONSTRAINT `discipline_case_type_id_fkey` FOREIGN KEY (`case_type_id`) REFERENCES `discipline_case_type`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `discipline` ADD CONSTRAINT `discipline_attachment_id_fkey` FOREIGN KEY (`attachment_id`) REFERENCES `attachment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `education` ADD CONSTRAINT `education_training_type_id_fkey` FOREIGN KEY (`training_type_id`) REFERENCES `training_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `education` ADD CONSTRAINT `education_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `education` ADD CONSTRAINT `education_duration_measure_id_fkey` FOREIGN KEY (`duration_measure_id`) REFERENCES `duration_measure`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `education` ADD CONSTRAINT `education_field_of_study_id_fkey` FOREIGN KEY (`field_of_study_id`) REFERENCES `field_of_study`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee` ADD CONSTRAINT `employee_employee_type_id_fkey` FOREIGN KEY (`employee_type_id`) REFERENCES `employee_type`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee` ADD CONSTRAINT `employee_nationality_id_fkey` FOREIGN KEY (`nationality_id`) REFERENCES `nationality`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee` ADD CONSTRAINT `employee_country_id_fkey` FOREIGN KEY (`country_id`) REFERENCES `country`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee` ADD CONSTRAINT `employee_language_id_fkey` FOREIGN KEY (`language_id`) REFERENCES `language`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee` ADD CONSTRAINT `employee_title_id_fkey` FOREIGN KEY (`title_id`) REFERENCES `title`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee` ADD CONSTRAINT `employee_religion_id_fkey` FOREIGN KEY (`religion_id`) REFERENCES `religion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_action` ADD CONSTRAINT `employee_action_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_action` ADD CONSTRAINT `employee_action_attachment_id_fkey` FOREIGN KEY (`attachment_id`) REFERENCES `attachment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_action` ADD CONSTRAINT `employee_action_action_reason_id_fkey` FOREIGN KEY (`action_reason_id`) REFERENCES `action_reason`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_attachment` ADD CONSTRAINT `employee_attachment_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_contact` ADD CONSTRAINT `employee_contact_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_id_range` ADD CONSTRAINT `employee_id_range_employee_type_id_fkey` FOREIGN KEY (`employee_type_id`) REFERENCES `employee_type`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_loan_repayment` ADD CONSTRAINT `employee_loan_repayment_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_loan_repayment` ADD CONSTRAINT `employee_loan_repayment_salary_component_id_fkey` FOREIGN KEY (`salary_component_id`) REFERENCES `salary_component`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_pay_frequency` ADD CONSTRAINT `employee_pay_frequency_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_pay_frequency` ADD CONSTRAINT `employee_pay_frequency_payroll_frequency_type_id_fkey` FOREIGN KEY (`payroll_frequency_type_id`) REFERENCES `payroll_frequency_type`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_paygrade` ADD CONSTRAINT `employee_paygrade_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_paygrade` ADD CONSTRAINT `employee_paygrade_paygrade_id_fkey` FOREIGN KEY (`paygrade_id`) REFERENCES `paygrade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_salary_component` ADD CONSTRAINT `employee_salary_component_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_salary_component` ADD CONSTRAINT `employee_salary_component_salary_component_id_fkey` FOREIGN KEY (`salary_component_id`) REFERENCES `salary_component`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `experience` ADD CONSTRAINT `experience_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leave_assignment` ADD CONSTRAINT `leave_assignment_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leave_assignment` ADD CONSTRAINT `leave_assignment_attendance_abscence_type_id_fkey` FOREIGN KEY (`attendance_abscence_type_id`) REFERENCES `attendance_abscence_type`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leave_entitlement` ADD CONSTRAINT `leave_entitlement_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leave_entitlement` ADD CONSTRAINT `leave_entitlement_attendance_abscence_type_id_fkey` FOREIGN KEY (`attendance_abscence_type_id`) REFERENCES `attendance_abscence_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leave_transfer` ADD CONSTRAINT `leave_transfer_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `license` ADD CONSTRAINT `license_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `license` ADD CONSTRAINT `license_license_type_id_fkey` FOREIGN KEY (`license_type_id`) REFERENCES `license_type`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `org_assignment` ADD CONSTRAINT `org_assignment_business_unit_id_fkey` FOREIGN KEY (`business_unit_id`) REFERENCES `business_unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `org_assignment` ADD CONSTRAINT `org_assignment_job_title_id_fkey` FOREIGN KEY (`job_title_id`) REFERENCES `job_title`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `org_assignment` ADD CONSTRAINT `org_assignment_employee_action_id_fkey` FOREIGN KEY (`employee_action_id`) REFERENCES `employee_action`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `org_assignment` ADD CONSTRAINT `org_assignment_employee_group_id_fkey` FOREIGN KEY (`employee_group_id`) REFERENCES `employee_group`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `org_assignment` ADD CONSTRAINT `org_assignment_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_allowance_pay` ADD CONSTRAINT `service_allowance_pay_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shift_assignment` ADD CONSTRAINT `shift_assignment_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shift_assignment` ADD CONSTRAINT `shift_assignment_shift_schedule_hdr_id_fkey` FOREIGN KEY (`shift_schedule_hdr_id`) REFERENCES `shift_schedule_hdr`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
