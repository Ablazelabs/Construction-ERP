/*
  Warnings:

  - Added the required column `createdBy` to the `external_applicant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `external_applicant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `external_applicant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `external_applicant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `external_applicant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `vacancy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `vacancy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `vacancy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `vacancy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `vacancy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `vacancy_applicant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `vacancy_applicant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `vacancy_applicant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `vacancy_applicant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `vacancy_applicant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `vacancy_examiner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `vacancy_examiner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `vacancy_examiner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `vacancy_examiner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `vacancy_examiner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `vacancy_internal_applicant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `vacancy_internal_applicant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `vacancy_internal_applicant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `vacancy_internal_applicant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `vacancy_internal_applicant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `vacancy_request_reason` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `vacancy_request_reason` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `vacancy_request_reason` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `vacancy_request_reason` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `vacancy_request_reason` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `external_applicant` ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `vacancy` ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `vacancy_applicant` ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `vacancy_examiner` ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `vacancy_internal_applicant` ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `vacancy_request_reason` ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;
