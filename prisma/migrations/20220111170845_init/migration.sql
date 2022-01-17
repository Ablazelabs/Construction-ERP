/*
  Warnings:

  - The primary key for the `number_tracker` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Id` on the `number_tracker` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `attendance_abscence_type` ADD COLUMN `aa_type` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `number_tracker` DROP PRIMARY KEY,
    DROP COLUMN `Id`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);
