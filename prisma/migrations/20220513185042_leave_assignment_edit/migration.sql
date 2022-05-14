-- AlterTable
ALTER TABLE `user` ADD COLUMN `leave_assignmentId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_leave_assignmentId_fkey` FOREIGN KEY (`leave_assignmentId`) REFERENCES `leave_assignment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
