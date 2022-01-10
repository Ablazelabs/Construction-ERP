/*
  Warnings:

  - You are about to alter the column `is_debit` on the `account_category` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `TinyInt`.
  - A unique constraint covering the columns `[name]` on the table `company` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `account_category` MODIFY `is_debit` BOOLEAN NULL;

-- CreateIndex
CREATE UNIQUE INDEX `company_name_key` ON `company`(`name`);
