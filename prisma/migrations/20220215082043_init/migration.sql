-- CreateTable
CREATE TABLE `opening_balance_account` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `debit_or_credit` INTEGER NOT NULL,
    `amount_credit` DOUBLE NULL,
    `amount_debit` DOUBLE NULL,
    `opening_balance_id` INTEGER NOT NULL,
    `currency_id` INTEGER NULL,
    `chart_of_account_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `opening_balance_account` ADD CONSTRAINT `opening_balance_account_opening_balance_id_fkey` FOREIGN KEY (`opening_balance_id`) REFERENCES `opening_balance`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `opening_balance_account` ADD CONSTRAINT `opening_balance_account_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currency`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `opening_balance_account` ADD CONSTRAINT `opening_balance_account_chart_of_account_id_fkey` FOREIGN KEY (`chart_of_account_id`) REFERENCES `chart_of_account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
