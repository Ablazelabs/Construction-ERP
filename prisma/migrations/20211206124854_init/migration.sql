/*
  Warnings:

  - You are about to drop the column `Date` on the `daily_work_log` table. All the data in the column will be lost.
  - Added the required column `date` to the `daily_work_log` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `daily_work_log` DROP COLUMN `Date`,
    ADD COLUMN `date` DATETIME(3) NOT NULL;
