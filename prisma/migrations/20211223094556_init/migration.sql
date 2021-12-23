/*
  Warnings:

  - A unique constraint covering the columns `[aa_description]` on the table `attendance_abscence_type` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shift_name]` on the table `shift_schedule_hdr` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sub_shift_name]` on the table `sub_shift_group` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE `attendance_captured` (
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
    `in_out_mode` INTEGER NULL,
    `punch_device_id` INTEGER NULL,
    `employee_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendance_payroll` (
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
    `total_worked_hours` DOUBLE NULL,
    `attendance_status` INTEGER NULL,
    `action_date` DATETIME(3) NULL,
    `delegated_username` VARCHAR(191) NULL,
    `attendance_abscence_type_id` INTEGER NULL,
    `employee_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `device_id_mapping` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `finger_print_id` VARCHAR(191) NOT NULL,
    `employee_id` INTEGER NOT NULL,
    `punch_device_id` INTEGER NULL,

    UNIQUE INDEX `device_id_mapping_finger_print_id_key`(`finger_print_id`),
    UNIQUE INDEX `device_id_mapping_employee_id_key`(`employee_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `holiday` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `holiday_name` VARCHAR(191) NOT NULL,
    `is_recurring` BOOLEAN NULL,

    UNIQUE INDEX `holiday_holiday_name_key`(`holiday_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `holiday_character` (
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

    UNIQUE INDEX `holiday_character_date_key`(`date`),
    UNIQUE INDEX `holiday_character_holiday_id_key`(`holiday_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leave_period` (
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

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leave_plan` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `is_half_day` BOOLEAN NOT NULL,
    `leave_request_status` INTEGER NULL,
    `action_date` DATETIME(3) NULL,
    `delegated_username` VARCHAR(191) NULL,
    `employee_id` INTEGER NOT NULL,

    UNIQUE INDEX `leave_plan_employee_id_key`(`employee_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `punch` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `punch_date` DATETIME(3) NOT NULL,
    `in_out_mode` INTEGER NULL,
    `is_manual` BOOLEAN NULL,
    `imported_by` VARCHAR(191) NULL,
    `approved_by` VARCHAR(191) NULL,
    `verify_mode` INTEGER NULL,
    `imported_date` DATETIME(3) NULL,
    `remark` VARCHAR(191) NULL,
    `punch_device_id` INTEGER NOT NULL,
    `employee_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `punch_device` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `device_name` VARCHAR(191) NOT NULL,
    `ip_address` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `punch_device_device_name_key`(`device_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `punch_log` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `imported_date` DATETIME(3) NULL,
    `log_remark` VARCHAR(191) NULL,
    `punch_device_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `punch_manual_import` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `is_processed` BOOLEAN NULL,
    `remark` VARCHAR(191) NULL,
    `processing_date` DATETIME(3) NULL,
    `is_processing_started` BOOLEAN NULL,
    `punch_device_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `punch_time` (
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
    `total_worked_hours` DOUBLE NULL,
    `employee_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shift_schedule_dtl` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clock_in` DOUBLE NOT NULL,
    `clock_out` DOUBLE NOT NULL,
    `min_working_hours` DOUBLE NOT NULL,
    `working_day` INTEGER NULL,
    `is_shift_span_next_day` BOOLEAN NULL,
    `is_half_day` BOOLEAN NULL,
    `shift_schedule_hdr_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `attendance_abscence_type_aa_description_key` ON `attendance_abscence_type`(`aa_description`);

-- CreateIndex
CREATE UNIQUE INDEX `shift_schedule_hdr_shift_name_key` ON `shift_schedule_hdr`(`shift_name`);

-- CreateIndex
CREATE UNIQUE INDEX `sub_shift_group_sub_shift_name_key` ON `sub_shift_group`(`sub_shift_name`);

-- AddForeignKey
ALTER TABLE `attendance_captured` ADD CONSTRAINT `attendance_captured_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_captured` ADD CONSTRAINT `attendance_captured_punch_device_id_fkey` FOREIGN KEY (`punch_device_id`) REFERENCES `punch_device`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_payroll` ADD CONSTRAINT `attendance_payroll_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_payroll` ADD CONSTRAINT `attendance_payroll_attendance_abscence_type_id_fkey` FOREIGN KEY (`attendance_abscence_type_id`) REFERENCES `attendance_abscence_type`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `device_id_mapping` ADD CONSTRAINT `device_id_mapping_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `device_id_mapping` ADD CONSTRAINT `device_id_mapping_punch_device_id_fkey` FOREIGN KEY (`punch_device_id`) REFERENCES `punch_device`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `holiday_character` ADD CONSTRAINT `holiday_character_holiday_id_fkey` FOREIGN KEY (`holiday_id`) REFERENCES `holiday`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leave_plan` ADD CONSTRAINT `leave_plan_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `punch` ADD CONSTRAINT `punch_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `punch` ADD CONSTRAINT `punch_punch_device_id_fkey` FOREIGN KEY (`punch_device_id`) REFERENCES `punch_device`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `punch_log` ADD CONSTRAINT `punch_log_punch_device_id_fkey` FOREIGN KEY (`punch_device_id`) REFERENCES `punch_device`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `punch_manual_import` ADD CONSTRAINT `punch_manual_import_punch_device_id_fkey` FOREIGN KEY (`punch_device_id`) REFERENCES `punch_device`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `punch_time` ADD CONSTRAINT `punch_time_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shift_schedule_dtl` ADD CONSTRAINT `shift_schedule_dtl_shift_schedule_hdr_id_fkey` FOREIGN KEY (`shift_schedule_hdr_id`) REFERENCES `shift_schedule_hdr`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
