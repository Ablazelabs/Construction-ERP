/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `equipment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `evaluation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `instruction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `manpower` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `material` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `material_category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `phase` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `priority` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `category_name_key` ON `category`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `equipment_name_key` ON `equipment`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `evaluation_name_key` ON `evaluation`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `instruction_name_key` ON `instruction`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `manpower_name_key` ON `manpower`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `material_name_key` ON `material`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `material_category_name_key` ON `material_category`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `phase_name_key` ON `phase`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `priority_name_key` ON `priority`(`name`);
