/*
  Warnings:

  - Added the required column `createdBy` to the `daily_work_log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `daily_work_log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `daily_work_log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `daily_work_log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `daily_work_log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `instruction_given_on_project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `instruction_given_on_project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `instruction_given_on_project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `instruction_given_on_project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `instruction_given_on_project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `invoice_tracking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `invoice_tracking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `invoice_tracking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `invoice_tracking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `invoice_tracking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `manpower_requirement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `manpower_requirement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `manpower_requirement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `manpower_requirement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `manpower_requirement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `required_equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `required_equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `required_equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `required_equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `required_equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `required_material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `required_material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `required_material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `required_material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `required_material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `risk_tracking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `risk_tracking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `risk_tracking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `risk_tracking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `risk_tracking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `simple_task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `simple_task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `simple_task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `simple_task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `simple_task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `sub_task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `sub_task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `sub_task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `sub_task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `sub_task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `task_manager` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `task_manager` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `task_manager` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `task_manager` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `task_manager` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `todos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `todos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `todos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `todos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `todos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `weather_data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `weather_data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `weather_data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `weather_data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `weather_data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `work_log_and_branch_of_work` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `work_log_and_branch_of_work` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `work_log_and_branch_of_work` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `work_log_and_branch_of_work` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `work_log_and_branch_of_work` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `daily_work_log` ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `instruction_given_on_project` ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `invoice_tracking` ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `manpower_requirement` ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `project` ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `request` ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `required_equipment` ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `required_material` ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `risk_tracking` ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `simple_task` ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `sub_task` ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `task_manager` ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `todos` ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `weather_data` ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `work_log_and_branch_of_work` ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;
