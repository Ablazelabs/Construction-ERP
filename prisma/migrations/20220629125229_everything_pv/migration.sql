/*
  Warnings:

  - You are about to drop the column `balance` on the `petty_cash` table. All the data in the column will be lost.
  - You are about to drop the column `cash_payment_voucher_id` on the `petty_cash` table. All the data in the column will be lost.
  - You are about to drop the column `credit` on the `petty_cash` table. All the data in the column will be lost.
  - You are about to drop the column `debit` on the `petty_cash` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `petty_cash` table. All the data in the column will be lost.
  - You are about to drop the column `issued_by_id` on the `petty_cash` table. All the data in the column will be lost.
  - You are about to drop the column `pcpv` on the `petty_cash` table. All the data in the column will be lost.
  - You are about to drop the column `project_id` on the `petty_cash` table. All the data in the column will be lost.
  - Added the required column `amount_paid` to the `petty_cash` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_request_id` to the `petty_cash` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reason` to the `petty_cash` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `petty_cash` DROP FOREIGN KEY `petty_cash_cash_payment_voucher_id_fkey`;

-- DropForeignKey
ALTER TABLE `petty_cash` DROP FOREIGN KEY `petty_cash_issued_by_id_fkey`;

-- DropForeignKey
ALTER TABLE `petty_cash` DROP FOREIGN KEY `petty_cash_project_id_fkey`;

-- AlterTable
ALTER TABLE `petty_cash` DROP COLUMN `balance`,
    DROP COLUMN `cash_payment_voucher_id`,
    DROP COLUMN `credit`,
    DROP COLUMN `debit`,
    DROP COLUMN `description`,
    DROP COLUMN `issued_by_id`,
    DROP COLUMN `pcpv`,
    DROP COLUMN `project_id`,
    ADD COLUMN `amount_paid` DOUBLE NOT NULL,
    ADD COLUMN `approved_by_id` INTEGER NULL,
    ADD COLUMN `cash_payment_voucherId` INTEGER NULL,
    ADD COLUMN `checked_by_id` INTEGER NULL,
    ADD COLUMN `employeeId` INTEGER NULL,
    ADD COLUMN `money_received` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `paid_to_id` INTEGER NULL,
    ADD COLUMN `paid_to_id_file` VARCHAR(191) NULL,
    ADD COLUMN `paid_to_name` VARCHAR(191) NULL,
    ADD COLUMN `payment_request_id` INTEGER NOT NULL,
    ADD COLUMN `pcpv_number` INTEGER NULL,
    ADD COLUMN `prepared_by_id` INTEGER NULL,
    ADD COLUMN `projectId` INTEGER NULL,
    ADD COLUMN `reason` VARCHAR(300) NOT NULL,
    MODIFY `remark` VARCHAR(300) NULL;

-- AlterTable
ALTER TABLE `project_request` ADD COLUMN `finance_approved_by_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `payment_request` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `to` VARCHAR(191) NOT NULL,
    `from` VARCHAR(191) NOT NULL,
    `prepare_payment_to_id` INTEGER NULL,
    `prepare_payment_to_name` VARCHAR(191) NULL,
    `prepare_payment_to_id_file` VARCHAR(191) NULL,
    `amount` DOUBLE NOT NULL,
    `for` INTEGER NOT NULL,
    `project_request_id` INTEGER NULL,
    `project_id` INTEGER NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `pv_no` INTEGER NULL,
    `check_no` INTEGER NULL,
    `bank_id` INTEGER NULL,
    `account_number` INTEGER NULL,
    `additional_docs` VARCHAR(2000) NOT NULL,
    `number_of_documents` INTEGER NOT NULL DEFAULT 0,
    `prepared_by_id` INTEGER NULL,
    `checked_by_id` INTEGER NULL,
    `approved_by_id` INTEGER NULL,
    `balance` DOUBLE NOT NULL,
    `remaining_balance` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `project_request` ADD CONSTRAINT `project_request_finance_approved_by_id_fkey` FOREIGN KEY (`finance_approved_by_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_request` ADD CONSTRAINT `payment_request_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_request` ADD CONSTRAINT `payment_request_project_request_id_fkey` FOREIGN KEY (`project_request_id`) REFERENCES `project_request`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_request` ADD CONSTRAINT `payment_request_bank_id_fkey` FOREIGN KEY (`bank_id`) REFERENCES `bank`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_request` ADD CONSTRAINT `payment_request_prepare_payment_to_id_fkey` FOREIGN KEY (`prepare_payment_to_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_request` ADD CONSTRAINT `payment_request_prepared_by_id_fkey` FOREIGN KEY (`prepared_by_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_request` ADD CONSTRAINT `payment_request_checked_by_id_fkey` FOREIGN KEY (`checked_by_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_request` ADD CONSTRAINT `payment_request_approved_by_id_fkey` FOREIGN KEY (`approved_by_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `petty_cash` ADD CONSTRAINT `petty_cash_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `petty_cash` ADD CONSTRAINT `petty_cash_cash_payment_voucherId_fkey` FOREIGN KEY (`cash_payment_voucherId`) REFERENCES `cash_payment_voucher`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `petty_cash` ADD CONSTRAINT `petty_cash_payment_request_id_fkey` FOREIGN KEY (`payment_request_id`) REFERENCES `payment_request`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `petty_cash` ADD CONSTRAINT `petty_cash_paid_to_id_fkey` FOREIGN KEY (`paid_to_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `petty_cash` ADD CONSTRAINT `petty_cash_prepared_by_id_fkey` FOREIGN KEY (`prepared_by_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `petty_cash` ADD CONSTRAINT `petty_cash_checked_by_id_fkey` FOREIGN KEY (`checked_by_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `petty_cash` ADD CONSTRAINT `petty_cash_approved_by_id_fkey` FOREIGN KEY (`approved_by_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `petty_cash` ADD CONSTRAINT `petty_cash_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
