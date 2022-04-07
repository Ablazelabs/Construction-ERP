/*
  Warnings:

  - You are about to drop the column `dependency_id` on the `task_manager` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `todos` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `task_manager` DROP FOREIGN KEY `task_manager_dependency_id_fkey`;

-- DropForeignKey
ALTER TABLE `todos` DROP FOREIGN KEY `todos_priority_id_fkey`;

-- DropForeignKey
ALTER TABLE `todos` DROP FOREIGN KEY `todos_project_id_fkey`;

-- AlterTable
ALTER TABLE `task_manager` DROP COLUMN `dependency_id`;

-- AlterTable
ALTER TABLE `todos` DROP COLUMN `date`,
    ADD COLUMN `completed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sub_task_id` INTEGER NULL,
    MODIFY `notes` VARCHAR(191) NULL,
    MODIFY `project_id` INTEGER NULL,
    MODIFY `priority_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `_dependency` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_dependency_AB_unique`(`A`, `B`),
    INDEX `_dependency_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_sub_task_dependency` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_sub_task_dependency_AB_unique`(`A`, `B`),
    INDEX `_sub_task_dependency_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `todos` ADD CONSTRAINT `todos_sub_task_id_fkey` FOREIGN KEY (`sub_task_id`) REFERENCES `sub_task`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `todos` ADD CONSTRAINT `todos_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `todos` ADD CONSTRAINT `todos_priority_id_fkey` FOREIGN KEY (`priority_id`) REFERENCES `priority`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_dependency` ADD FOREIGN KEY (`A`) REFERENCES `task_manager`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_dependency` ADD FOREIGN KEY (`B`) REFERENCES `task_manager`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_sub_task_dependency` ADD FOREIGN KEY (`A`) REFERENCES `sub_task`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_sub_task_dependency` ADD FOREIGN KEY (`B`) REFERENCES `sub_task`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
