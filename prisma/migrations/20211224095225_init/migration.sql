-- AlterTable
ALTER TABLE `attendance_abscence_type` MODIFY `number_of_days` INTEGER NULL;

-- CreateTable
CREATE TABLE `unit_of_measure` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(191) NULL,
    `short_code` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `warehouse` (
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
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NULL,
    `zip_code` VARCHAR(191) NULL,
    `phone_no` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `is_primary` BOOLEAN NULL,
    `country_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_batch` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `batch_ref` VARCHAR(191) NOT NULL,
    `manufacturer` VARCHAR(191) NULL,
    `manufactured_date` DATETIME(3) NULL,
    `date_of_expiry` DATETIME(3) NULL,
    `remark` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_item` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_name` VARCHAR(191) NOT NULL,
    `SKU` VARCHAR(191) NOT NULL,
    `item_type` INTEGER NOT NULL,
    `reorder_level` INTEGER NOT NULL,
    `stock_item_tracking` INTEGER NULL,
    `item_can_be` INTEGER NULL,
    `is_item_returnable` BOOLEAN NULL,
    `UPC` VARCHAR(191) NULL,
    `EAN` VARCHAR(191) NULL,
    `MPN` VARCHAR(191) NULL,
    `ISBN` VARCHAR(191) NULL,
    `selling_price` DOUBLE NULL,
    `additional_sales_info` VARCHAR(191) NULL,
    `purchasing_price` DOUBLE NULL,
    `addtional_purchase_info` VARCHAR(191) NULL,
    `item_group_id` INTEGER NULL,
    `dimensions` VARCHAR(191) NULL,
    `manufacturer` VARCHAR(191) NULL,
    `inventory_tracking_chart_of_account_id` INTEGER NULL,
    `purchase_chart_of_account_id` INTEGER NULL,
    `sales_chart_of_account_id` INTEGER NULL,
    `unit_of_measure_id` INTEGER NULL,
    `tax_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_transaction_detail` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transaction_date` DATETIME(3) NULL,
    `note` VARCHAR(191) NULL,
    `price` DOUBLE NULL,
    `quantity` DOUBLE NULL,
    `order_no` VARCHAR(191) NULL,
    `transaction_ref` VARCHAR(191) NULL,
    `is_opening_value` VARCHAR(191) NULL,
    `stock_transaction_type` INTEGER NULL,
    `stock_transaction_source` INTEGER NULL,
    `remark` VARCHAR(191) NULL,
    `serial_number` VARCHAR(191) NULL,
    `stock_batch_id` INTEGER NULL,
    `stock_transaction_header_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_transaction_header` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stock_item_id` INTEGER NOT NULL,
    `warehouse_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `warehouse` ADD CONSTRAINT `warehouse_country_id_fkey` FOREIGN KEY (`country_id`) REFERENCES `country`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_item` ADD CONSTRAINT `stock_item_unit_of_measure_id_fkey` FOREIGN KEY (`unit_of_measure_id`) REFERENCES `unit_of_measure`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_item` ADD CONSTRAINT `stock_item_tax_id_fkey` FOREIGN KEY (`tax_id`) REFERENCES `tax`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_item` ADD CONSTRAINT `stock_item_sales_chart_of_account_id_fkey` FOREIGN KEY (`sales_chart_of_account_id`) REFERENCES `chart_of_account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_item` ADD CONSTRAINT `stock_item_purchase_chart_of_account_id_fkey` FOREIGN KEY (`purchase_chart_of_account_id`) REFERENCES `chart_of_account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_item` ADD CONSTRAINT `stock_item_inventory_tracking_chart_of_account_id_fkey` FOREIGN KEY (`inventory_tracking_chart_of_account_id`) REFERENCES `chart_of_account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_transaction_detail` ADD CONSTRAINT `stock_transaction_detail_stock_batch_id_fkey` FOREIGN KEY (`stock_batch_id`) REFERENCES `stock_batch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_transaction_detail` ADD CONSTRAINT `stock_transaction_detail_stock_transaction_header_id_fkey` FOREIGN KEY (`stock_transaction_header_id`) REFERENCES `stock_transaction_header`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_transaction_header` ADD CONSTRAINT `stock_transaction_header_stock_item_id_fkey` FOREIGN KEY (`stock_item_id`) REFERENCES `stock_item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_transaction_header` ADD CONSTRAINT `stock_transaction_header_warehouse_id_fkey` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
