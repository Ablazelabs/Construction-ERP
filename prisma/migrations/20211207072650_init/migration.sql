/*
  Warnings:

  - You are about to drop the column `dateReceived` on the `invoice_tracking` table. All the data in the column will be lost.
  - Added the required column `date_received` to the `invoice_tracking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `invoice_tracking` DROP COLUMN `dateReceived`,
    ADD COLUMN `date_received` DATETIME(3) NOT NULL;
