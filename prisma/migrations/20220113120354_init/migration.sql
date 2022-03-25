/*
  Warnings:

  - Added the required column `createdBy` to the `employee_commitment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `employee_commitment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `employee_commitment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `employee_commitment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `employee_commitment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `employee_commitment` ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;
