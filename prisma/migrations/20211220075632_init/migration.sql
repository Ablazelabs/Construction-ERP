-- CreateTable
CREATE TABLE `employee_commitment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `commitment_type_id` INTEGER NOT NULL,
    `remark` VARCHAR(191) NULL,
    `employee_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `address` ADD CONSTRAINT `address_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_commitment` ADD CONSTRAINT `employee_commitment_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_commitment` ADD CONSTRAINT `employee_commitment_commitment_type_id_fkey` FOREIGN KEY (`commitment_type_id`) REFERENCES `commitment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
