/*
  Warnings:

  - You are about to drop the column `CreatedBy` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `CreationDate` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `EndDate` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `IsProtectedForEdit` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `RevisedBy` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `RevisionDate` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `StartDate` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `Status` on the `category` table. All the data in the column will be lost.
  - The primary key for the `client` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `CreatedBy` on the `client` table. All the data in the column will be lost.
  - You are about to drop the column `CreationDate` on the `client` table. All the data in the column will be lost.
  - You are about to drop the column `EndDate` on the `client` table. All the data in the column will be lost.
  - You are about to drop the column `Id` on the `client` table. All the data in the column will be lost.
  - You are about to drop the column `IsProtectedForEdit` on the `client` table. All the data in the column will be lost.
  - You are about to drop the column `RevisedBy` on the `client` table. All the data in the column will be lost.
  - You are about to drop the column `RevisionDate` on the `client` table. All the data in the column will be lost.
  - You are about to drop the column `StartDate` on the `client` table. All the data in the column will be lost.
  - You are about to drop the column `Status` on the `client` table. All the data in the column will be lost.
  - You are about to drop the column `CreatedBy` on the `equipment` table. All the data in the column will be lost.
  - You are about to drop the column `CreationDate` on the `equipment` table. All the data in the column will be lost.
  - You are about to drop the column `EndDate` on the `equipment` table. All the data in the column will be lost.
  - You are about to drop the column `IsProtectedForEdit` on the `equipment` table. All the data in the column will be lost.
  - You are about to drop the column `RevisedBy` on the `equipment` table. All the data in the column will be lost.
  - You are about to drop the column `RevisionDate` on the `equipment` table. All the data in the column will be lost.
  - You are about to drop the column `StartDate` on the `equipment` table. All the data in the column will be lost.
  - You are about to drop the column `Status` on the `equipment` table. All the data in the column will be lost.
  - You are about to drop the column `CreatedBy` on the `evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `CreationDate` on the `evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `EndDate` on the `evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `IsProtectedForEdit` on the `evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `RevisedBy` on the `evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `RevisionDate` on the `evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `StartDate` on the `evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `Status` on the `evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `CreatedBy` on the `instruction` table. All the data in the column will be lost.
  - You are about to drop the column `CreationDate` on the `instruction` table. All the data in the column will be lost.
  - You are about to drop the column `EndDate` on the `instruction` table. All the data in the column will be lost.
  - You are about to drop the column `IsProtectedForEdit` on the `instruction` table. All the data in the column will be lost.
  - You are about to drop the column `RevisedBy` on the `instruction` table. All the data in the column will be lost.
  - You are about to drop the column `RevisionDate` on the `instruction` table. All the data in the column will be lost.
  - You are about to drop the column `StartDate` on the `instruction` table. All the data in the column will be lost.
  - You are about to drop the column `Status` on the `instruction` table. All the data in the column will be lost.
  - You are about to drop the column `CreatedBy` on the `manpower` table. All the data in the column will be lost.
  - You are about to drop the column `CreationDate` on the `manpower` table. All the data in the column will be lost.
  - You are about to drop the column `EndDate` on the `manpower` table. All the data in the column will be lost.
  - You are about to drop the column `IsProtectedForEdit` on the `manpower` table. All the data in the column will be lost.
  - You are about to drop the column `RevisedBy` on the `manpower` table. All the data in the column will be lost.
  - You are about to drop the column `RevisionDate` on the `manpower` table. All the data in the column will be lost.
  - You are about to drop the column `StartDate` on the `manpower` table. All the data in the column will be lost.
  - You are about to drop the column `Status` on the `manpower` table. All the data in the column will be lost.
  - You are about to drop the column `CreatedBy` on the `material` table. All the data in the column will be lost.
  - You are about to drop the column `CreationDate` on the `material` table. All the data in the column will be lost.
  - You are about to drop the column `EndDate` on the `material` table. All the data in the column will be lost.
  - You are about to drop the column `IsProtectedForEdit` on the `material` table. All the data in the column will be lost.
  - You are about to drop the column `RevisedBy` on the `material` table. All the data in the column will be lost.
  - You are about to drop the column `RevisionDate` on the `material` table. All the data in the column will be lost.
  - You are about to drop the column `StartDate` on the `material` table. All the data in the column will be lost.
  - You are about to drop the column `Status` on the `material` table. All the data in the column will be lost.
  - You are about to drop the column `CreatedBy` on the `material_category` table. All the data in the column will be lost.
  - You are about to drop the column `CreationDate` on the `material_category` table. All the data in the column will be lost.
  - You are about to drop the column `EndDate` on the `material_category` table. All the data in the column will be lost.
  - You are about to drop the column `IsProtectedForEdit` on the `material_category` table. All the data in the column will be lost.
  - You are about to drop the column `RevisedBy` on the `material_category` table. All the data in the column will be lost.
  - You are about to drop the column `RevisionDate` on the `material_category` table. All the data in the column will be lost.
  - You are about to drop the column `StartDate` on the `material_category` table. All the data in the column will be lost.
  - You are about to drop the column `Status` on the `material_category` table. All the data in the column will be lost.
  - You are about to drop the column `CreatedBy` on the `phase` table. All the data in the column will be lost.
  - You are about to drop the column `CreationDate` on the `phase` table. All the data in the column will be lost.
  - You are about to drop the column `EndDate` on the `phase` table. All the data in the column will be lost.
  - You are about to drop the column `IsProtectedForEdit` on the `phase` table. All the data in the column will be lost.
  - You are about to drop the column `RevisedBy` on the `phase` table. All the data in the column will be lost.
  - You are about to drop the column `RevisionDate` on the `phase` table. All the data in the column will be lost.
  - You are about to drop the column `StartDate` on the `phase` table. All the data in the column will be lost.
  - You are about to drop the column `Status` on the `phase` table. All the data in the column will be lost.
  - You are about to drop the column `CreatedBy` on the `priority` table. All the data in the column will be lost.
  - You are about to drop the column `CreationDate` on the `priority` table. All the data in the column will be lost.
  - You are about to drop the column `EndDate` on the `priority` table. All the data in the column will be lost.
  - You are about to drop the column `IsProtectedForEdit` on the `priority` table. All the data in the column will be lost.
  - You are about to drop the column `RevisedBy` on the `priority` table. All the data in the column will be lost.
  - You are about to drop the column `RevisionDate` on the `priority` table. All the data in the column will be lost.
  - You are about to drop the column `StartDate` on the `priority` table. All the data in the column will be lost.
  - You are about to drop the column `Status` on the `priority` table. All the data in the column will be lost.
  - Added the required column `createdBy` to the `category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `instruction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `instruction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `instruction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `instruction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `instruction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `manpower` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `manpower` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `manpower` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `manpower` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `manpower` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `material_category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `material_category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `material_category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `material_category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `material_category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `phase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `phase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `phase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `phase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `phase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `priority` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `priority` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisedBy` to the `priority` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionDate` to the `priority` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `priority` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `category` DROP COLUMN `CreatedBy`,
    DROP COLUMN `CreationDate`,
    DROP COLUMN `EndDate`,
    DROP COLUMN `IsProtectedForEdit`,
    DROP COLUMN `RevisedBy`,
    DROP COLUMN `RevisionDate`,
    DROP COLUMN `StartDate`,
    DROP COLUMN `Status`,
    ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `client` DROP PRIMARY KEY,
    DROP COLUMN `CreatedBy`,
    DROP COLUMN `CreationDate`,
    DROP COLUMN `EndDate`,
    DROP COLUMN `Id`,
    DROP COLUMN `IsProtectedForEdit`,
    DROP COLUMN `RevisedBy`,
    DROP COLUMN `RevisionDate`,
    DROP COLUMN `StartDate`,
    DROP COLUMN `Status`,
    ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `equipment` DROP COLUMN `CreatedBy`,
    DROP COLUMN `CreationDate`,
    DROP COLUMN `EndDate`,
    DROP COLUMN `IsProtectedForEdit`,
    DROP COLUMN `RevisedBy`,
    DROP COLUMN `RevisionDate`,
    DROP COLUMN `StartDate`,
    DROP COLUMN `Status`,
    ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `evaluation` DROP COLUMN `CreatedBy`,
    DROP COLUMN `CreationDate`,
    DROP COLUMN `EndDate`,
    DROP COLUMN `IsProtectedForEdit`,
    DROP COLUMN `RevisedBy`,
    DROP COLUMN `RevisionDate`,
    DROP COLUMN `StartDate`,
    DROP COLUMN `Status`,
    ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `instruction` DROP COLUMN `CreatedBy`,
    DROP COLUMN `CreationDate`,
    DROP COLUMN `EndDate`,
    DROP COLUMN `IsProtectedForEdit`,
    DROP COLUMN `RevisedBy`,
    DROP COLUMN `RevisionDate`,
    DROP COLUMN `StartDate`,
    DROP COLUMN `Status`,
    ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `manpower` DROP COLUMN `CreatedBy`,
    DROP COLUMN `CreationDate`,
    DROP COLUMN `EndDate`,
    DROP COLUMN `IsProtectedForEdit`,
    DROP COLUMN `RevisedBy`,
    DROP COLUMN `RevisionDate`,
    DROP COLUMN `StartDate`,
    DROP COLUMN `Status`,
    ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `material` DROP COLUMN `CreatedBy`,
    DROP COLUMN `CreationDate`,
    DROP COLUMN `EndDate`,
    DROP COLUMN `IsProtectedForEdit`,
    DROP COLUMN `RevisedBy`,
    DROP COLUMN `RevisionDate`,
    DROP COLUMN `StartDate`,
    DROP COLUMN `Status`,
    ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `material_category` DROP COLUMN `CreatedBy`,
    DROP COLUMN `CreationDate`,
    DROP COLUMN `EndDate`,
    DROP COLUMN `IsProtectedForEdit`,
    DROP COLUMN `RevisedBy`,
    DROP COLUMN `RevisionDate`,
    DROP COLUMN `StartDate`,
    DROP COLUMN `Status`,
    ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `phase` DROP COLUMN `CreatedBy`,
    DROP COLUMN `CreationDate`,
    DROP COLUMN `EndDate`,
    DROP COLUMN `IsProtectedForEdit`,
    DROP COLUMN `RevisedBy`,
    DROP COLUMN `RevisionDate`,
    DROP COLUMN `StartDate`,
    DROP COLUMN `Status`,
    ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `priority` DROP COLUMN `CreatedBy`,
    DROP COLUMN `CreationDate`,
    DROP COLUMN `EndDate`,
    DROP COLUMN `IsProtectedForEdit`,
    DROP COLUMN `RevisedBy`,
    DROP COLUMN `RevisionDate`,
    DROP COLUMN `StartDate`,
    DROP COLUMN `Status`,
    ADD COLUMN `createdBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revisedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `revisionDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;
