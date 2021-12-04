/*
  Warnings:

  - You are about to drop the `category` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `category`;

-- CreateTable
CREATE TABLE `work_category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `work_category_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `project_manager` VARCHAR(191) NOT NULL,
    `project_start_date` DATETIME(3) NOT NULL,
    `project_end_date` DATETIME(3) NOT NULL,
    `project_description` VARCHAR(191) NULL,
    `project_id` VARCHAR(191) NOT NULL,
    `contract_number` VARCHAR(191) NOT NULL,
    `site_engineer` VARCHAR(191) NOT NULL,
    `dupty_manager` VARCHAR(191) NOT NULL,
    `project_address` VARCHAR(191) NOT NULL,
    `client_id` INTEGER NOT NULL,

    UNIQUE INDEX `project_project_id_key`(`project_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `daily_work_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `weather` VARCHAR(191) NOT NULL,
    `day` VARCHAR(191) NOT NULL,
    `temprature` VARCHAR(191) NOT NULL,
    `time` VARCHAR(191) NOT NULL,
    `name_of_employee` VARCHAR(191) NOT NULL,
    `contact` VARCHAR(191) NOT NULL,
    `cell_phone` VARCHAR(191) NOT NULL,
    `contract_no` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `Date` DATETIME(3) NOT NULL,
    `project_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instruction_given_on_project` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `yes_no` BOOLEAN NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `date` DATETIME(3) NOT NULL,
    `project_id` INTEGER NOT NULL,
    `instruction_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `manpower_requirement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `number_of_planned_man_power` INTEGER NOT NULL,
    `number_of_actual_man_power` INTEGER NULL,
    `food_expense` DOUBLE NOT NULL,
    `wage` DOUBLE NOT NULL,
    `house_rent` DOUBLE NOT NULL,
    `transportation` DOUBLE NOT NULL,
    `total_expense` DOUBLE NOT NULL,
    `remark` VARCHAR(191) NULL,
    `manpower_id` INTEGER NOT NULL,
    `project_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `required_equipment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `planned_equipment_number` INTEGER NOT NULL,
    `actual_equipment_number` INTEGER NULL,
    `equipment_lifetime` VARCHAR(191) NOT NULL,
    `expense` DOUBLE NOT NULL,
    `house_rent` DOUBLE NOT NULL,
    `transportation` DOUBLE NOT NULL,
    `total_expense` DOUBLE NOT NULL,
    `remark` VARCHAR(191) NULL,
    `equipment_id` INTEGER NOT NULL,
    `project_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `required_material` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `planned_quantity` DOUBLE NOT NULL,
    `planned_unit_price` DOUBLE NOT NULL,
    `planned_total_amount` DOUBLE NOT NULL,
    `delivered_quantity` DOUBLE NULL,
    `delivered_unit_price` DOUBLE NULL,
    `delivered_total_amount` DOUBLE NULL,
    `total_expense` DOUBLE NULL,
    `remark` VARCHAR(191) NULL,
    `delivery_date` DATETIME(3) NULL,
    `material_id` INTEGER NOT NULL,
    `project_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `risk_tracking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(191) NULL,
    `impact` VARCHAR(191) NOT NULL,
    `risk_response` VARCHAR(191) NULL,
    `risk_level` VARCHAR(191) NOT NULL,
    `risk_owner` VARCHAR(191) NOT NULL,
    `remark` VARCHAR(191) NULL,
    `work_category_id` INTEGER NOT NULL,
    `project_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_manager` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `task_start_date` VARCHAR(191) NOT NULL,
    `task_end_date` VARCHAR(191) NULL,
    `duration_in_days` VARCHAR(191) NOT NULL,
    `working_days` VARCHAR(191) NOT NULL,
    `project_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sub_task` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `task_start_date` DATETIME(3) NOT NULL,
    `task_end_date` DATETIME(3) NULL,
    `duration_in_days` INTEGER NOT NULL,
    `working_days` INTEGER NOT NULL,
    `task_manager_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `simple_task` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `note` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `task_start_date` DATETIME(3) NOT NULL,
    `task_end_date` DATETIME(3) NULL,
    `completed_percentage` DOUBLE NOT NULL DEFAULT 0,
    `estimated_hours` DOUBLE NOT NULL,
    `project_id` INTEGER NOT NULL,
    `priority_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `work_log_and_branch_of_work` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `skilled_worker` INTEGER NOT NULL,
    `hours` DOUBLE NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `work_category_id` INTEGER NOT NULL,
    `daily_work_log_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `weather_data` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `total_lost_hour` DOUBLE NOT NULL,
    `duration_of_lost_hour` DOUBLE NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `reason` VARCHAR(191) NULL,
    `reference` VARCHAR(191) NOT NULL,
    `project_id` INTEGER NOT NULL,
    `manpower_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `todos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `notes` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `project_id` INTEGER NOT NULL,
    `priority_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `request` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `RFI_no` VARCHAR(191) NOT NULL,
    `current_status` VARCHAR(191) NOT NULL,
    `request_description` VARCHAR(191) NULL,
    `request_by` VARCHAR(191) NOT NULL,
    `assigned_to` VARCHAR(191) NOT NULL,
    `date_requested` DATETIME(3) NOT NULL,
    `date_required` DATETIME(3) NULL,
    `date_responded` DATETIME(3) NULL,
    `notes` VARCHAR(191) NOT NULL,
    `project_id` INTEGER NOT NULL,
    `priority_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoice_tracking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `detail` VARCHAR(191) NULL,
    `amount` DOUBLE NOT NULL,
    `amount_received` DOUBLE NOT NULL,
    `balance` DOUBLE NOT NULL,
    `invoice_number` VARCHAR(191) NOT NULL,
    `dateReceived` DATETIME(3) NOT NULL,
    `notes` VARCHAR(191) NOT NULL,
    `client_id` INTEGER NOT NULL,

    UNIQUE INDEX `invoice_tracking_invoice_number_key`(`invoice_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `project` ADD CONSTRAINT `project_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_work_log` ADD CONSTRAINT `daily_work_log_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instruction_given_on_project` ADD CONSTRAINT `instruction_given_on_project_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instruction_given_on_project` ADD CONSTRAINT `instruction_given_on_project_instruction_id_fkey` FOREIGN KEY (`instruction_id`) REFERENCES `instruction`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `manpower_requirement` ADD CONSTRAINT `manpower_requirement_manpower_id_fkey` FOREIGN KEY (`manpower_id`) REFERENCES `manpower`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `manpower_requirement` ADD CONSTRAINT `manpower_requirement_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `required_equipment` ADD CONSTRAINT `required_equipment_equipment_id_fkey` FOREIGN KEY (`equipment_id`) REFERENCES `equipment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `required_equipment` ADD CONSTRAINT `required_equipment_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `required_material` ADD CONSTRAINT `required_material_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `material`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `required_material` ADD CONSTRAINT `required_material_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `risk_tracking` ADD CONSTRAINT `risk_tracking_work_category_id_fkey` FOREIGN KEY (`work_category_id`) REFERENCES `work_category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `risk_tracking` ADD CONSTRAINT `risk_tracking_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_manager` ADD CONSTRAINT `task_manager_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sub_task` ADD CONSTRAINT `sub_task_task_manager_id_fkey` FOREIGN KEY (`task_manager_id`) REFERENCES `task_manager`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `simple_task` ADD CONSTRAINT `simple_task_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `simple_task` ADD CONSTRAINT `simple_task_priority_id_fkey` FOREIGN KEY (`priority_id`) REFERENCES `priority`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_log_and_branch_of_work` ADD CONSTRAINT `work_log_and_branch_of_work_work_category_id_fkey` FOREIGN KEY (`work_category_id`) REFERENCES `work_category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_log_and_branch_of_work` ADD CONSTRAINT `work_log_and_branch_of_work_daily_work_log_id_fkey` FOREIGN KEY (`daily_work_log_id`) REFERENCES `daily_work_log`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `weather_data` ADD CONSTRAINT `weather_data_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `weather_data` ADD CONSTRAINT `weather_data_manpower_id_fkey` FOREIGN KEY (`manpower_id`) REFERENCES `manpower`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `todos` ADD CONSTRAINT `todos_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `todos` ADD CONSTRAINT `todos_priority_id_fkey` FOREIGN KEY (`priority_id`) REFERENCES `priority`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `request` ADD CONSTRAINT `request_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `request` ADD CONSTRAINT `request_priority_id_fkey` FOREIGN KEY (`priority_id`) REFERENCES `priority`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_tracking` ADD CONSTRAINT `invoice_tracking_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
