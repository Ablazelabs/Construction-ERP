/*
  Warnings:

  - A unique constraint covering the columns `[tradeName]` on the table `client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tel]` on the table `client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tinNumber]` on the table `client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contactPersonPhone]` on the table `client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contactPersonEmail]` on the table `client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `client` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `client_tradeName_key` ON `client`(`tradeName`);

-- CreateIndex
CREATE UNIQUE INDEX `client_tel_key` ON `client`(`tel`);

-- CreateIndex
CREATE UNIQUE INDEX `client_tinNumber_key` ON `client`(`tinNumber`);

-- CreateIndex
CREATE UNIQUE INDEX `client_contactPersonPhone_key` ON `client`(`contactPersonPhone`);

-- CreateIndex
CREATE UNIQUE INDEX `client_contactPersonEmail_key` ON `client`(`contactPersonEmail`);

-- CreateIndex
CREATE UNIQUE INDEX `client_email_key` ON `client`(`email`);
