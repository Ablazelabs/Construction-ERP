-- CreateTable
CREATE TABLE `cash_payment_custom` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `customer` VARCHAR(191) NULL,
    `amount` DOUBLE NULL,
    `tin_number` VARCHAR(191) NULL,
    `tax` DOUBLE NULL,
    `withholding` DOUBLE NULL,
    `merchant_record_card_code` VARCHAR(191) NULL,
    `number` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cash_payment_voucher` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `paid_to` VARCHAR(191) NULL,
    `amount` DOUBLE NULL,
    `description` VARCHAR(191) NULL,
    `check_number` VARCHAR(191) NULL,
    `pv_number` INTEGER NULL,
    `remaining_balance` INTEGER NULL,
    `cpv_bank_id` INTEGER NULL,
    `prepared_by_id` INTEGER NULL,
    `checked_by_id` INTEGER NULL,
    `project_id` INTEGER NULL,
    `cpv_type_id` INTEGER NULL,
    `request_payment_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `request_payment` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `amount` DOUBLE NULL,
    `request_type` INTEGER NULL,
    `approval_status` INTEGER NULL,
    `description` VARCHAR(191) NULL,
    `check_number` VARCHAR(191) NULL,
    `remaining_balance` INTEGER NULL,
    `prepared_by_id` INTEGER NULL,
    `checked_by_id` INTEGER NULL,
    `approved_by_id` INTEGER NULL,
    `project_id` INTEGER NULL,
    `cash_payment_voucher_id` INTEGER NULL,
    `from_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cpv_bank` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cpv_payment_request` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `amount` DOUBLE NULL,
    `description` VARCHAR(191) NULL,
    `check_number` VARCHAR(191) NULL,
    `remaining_balance` INTEGER NULL,
    `from_id` INTEGER NULL,
    `project_id` INTEGER NULL,
    `prepared_by_id` INTEGER NULL,
    `checked_by_id` INTEGER NULL,
    `approved_by_id` INTEGER NULL,
    `cash_payment_voucher_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cpv_receipt` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `company_name` VARCHAR(191) NULL,
    `tin_number` VARCHAR(191) NULL,
    `amount` DOUBLE NULL,
    `vat` DOUBLE NULL,
    `withholding` DOUBLE NULL,
    `machine_code` VARCHAR(191) NULL,
    `receipt_number` VARCHAR(191) NULL,
    `cash_payment_voucher_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cpv_type` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `cpv_types` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `petty_cash` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `pcpv` VARCHAR(191) NULL,
    `remark` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `debit` DOUBLE NULL,
    `credit` DOUBLE NULL,
    `balance` DOUBLE NULL,
    `project_id` INTEGER NULL,
    `issued_by_id` INTEGER NULL,
    `cash_payment_voucher_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `crv_payment` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NULL,
    `name` VARCHAR(191) NULL,
    `customer_name` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `amount_before_vat` DOUBLE NULL,
    `vat` DOUBLE NULL,
    `amount_with_vat` DOUBLE NULL,
    `payment_description` VARCHAR(191) NULL,
    `withholding` DOUBLE NULL,
    `check_amount` DOUBLE NULL,
    `cash_amount` DOUBLE NULL,
    `project_id` INTEGER NULL,
    `crv_type_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `crv_type` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `crv_types` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cash_payment_voucher` ADD CONSTRAINT `cash_payment_voucher_cpv_bank_id_fkey` FOREIGN KEY (`cpv_bank_id`) REFERENCES `cpv_bank`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cash_payment_voucher` ADD CONSTRAINT `cash_payment_voucher_checked_by_id_fkey` FOREIGN KEY (`checked_by_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cash_payment_voucher` ADD CONSTRAINT `cash_payment_voucher_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cash_payment_voucher` ADD CONSTRAINT `cash_payment_voucher_cpv_type_id_fkey` FOREIGN KEY (`cpv_type_id`) REFERENCES `cpv_type`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `request_payment` ADD CONSTRAINT `request_payment_from_id_fkey` FOREIGN KEY (`from_id`) REFERENCES `manpower`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `request_payment` ADD CONSTRAINT `request_payment_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `request_payment` ADD CONSTRAINT `request_payment_prepared_by_id_fkey` FOREIGN KEY (`prepared_by_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `request_payment` ADD CONSTRAINT `request_payment_checked_by_id_fkey` FOREIGN KEY (`checked_by_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `request_payment` ADD CONSTRAINT `request_payment_approved_by_id_fkey` FOREIGN KEY (`approved_by_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `request_payment` ADD CONSTRAINT `request_payment_cash_payment_voucher_id_fkey` FOREIGN KEY (`cash_payment_voucher_id`) REFERENCES `cash_payment_voucher`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cpv_payment_request` ADD CONSTRAINT `cpv_payment_request_from_id_fkey` FOREIGN KEY (`from_id`) REFERENCES `manpower`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cpv_payment_request` ADD CONSTRAINT `cpv_payment_request_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cpv_payment_request` ADD CONSTRAINT `cpv_payment_request_prepared_by_id_fkey` FOREIGN KEY (`prepared_by_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cpv_payment_request` ADD CONSTRAINT `cpv_payment_request_checked_by_id_fkey` FOREIGN KEY (`checked_by_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cpv_payment_request` ADD CONSTRAINT `cpv_payment_request_approved_by_id_fkey` FOREIGN KEY (`approved_by_id`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cpv_payment_request` ADD CONSTRAINT `cpv_payment_request_cash_payment_voucher_id_fkey` FOREIGN KEY (`cash_payment_voucher_id`) REFERENCES `cash_payment_voucher`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cpv_receipt` ADD CONSTRAINT `cpv_receipt_cash_payment_voucher_id_fkey` FOREIGN KEY (`cash_payment_voucher_id`) REFERENCES `cash_payment_voucher`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `petty_cash` ADD CONSTRAINT `petty_cash_cash_payment_voucher_id_fkey` FOREIGN KEY (`cash_payment_voucher_id`) REFERENCES `cash_payment_voucher`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `crv_payment` ADD CONSTRAINT `crv_payment_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `crv_payment` ADD CONSTRAINT `crv_payment_crv_type_id_fkey` FOREIGN KEY (`crv_type_id`) REFERENCES `crv_type`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
