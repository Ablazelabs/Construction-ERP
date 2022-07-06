/*
  Warnings:

  - You are about to drop the column `cash_payment_voucherId` on the `petty_cash` table. All the data in the column will be lost.
  - You are about to drop the column `employeeId` on the `petty_cash` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `petty_cash` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `petty_cash` DROP FOREIGN KEY `petty_cash_cash_payment_voucherId_fkey`;

-- DropForeignKey
ALTER TABLE `petty_cash` DROP FOREIGN KEY `petty_cash_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `petty_cash` DROP FOREIGN KEY `petty_cash_projectId_fkey`;

-- AlterTable
ALTER TABLE `payment_request` ADD COLUMN `action_note` VARCHAR(191) NULL,
    ADD COLUMN `approval_status` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `petty_cash` DROP COLUMN `cash_payment_voucherId`,
    DROP COLUMN `employeeId`,
    DROP COLUMN `projectId`;

-- AlterTable
ALTER TABLE `project_request` ADD COLUMN `finance_action_note` VARCHAR(191) NULL,
    ADD COLUMN `finance_approval_status` INTEGER NOT NULL DEFAULT 1;
