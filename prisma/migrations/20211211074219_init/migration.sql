-- CreateTable
CREATE TABLE `currency` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `currency_code` VARCHAR(191) NOT NULL,
    `currency_description` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `symbol` VARCHAR(191) NOT NULL,
    `price_precision` INTEGER NOT NULL,
    `currency_format` INTEGER NOT NULL,
    `is_base_currency` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `account_category` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `is_debit` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `closing_note` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `closing_type` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,
    `consideration` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `financial_statement_section` (
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
    `sequence_on_report` INTEGER NOT NULL,
    `financial_statement_type` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cost_center` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cost_center_code` VARCHAR(191) NOT NULL,
    `section_name` VARCHAR(191) NULL,
    `remark` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_term` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `show_it_as` VARCHAR(191) NULL,
    `number_of_days` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `date_format_type` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date_format` VARCHAR(191) NOT NULL,
    `date_format_type_category` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `industry` (
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
CREATE TABLE `foot_note` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `financial_statement_type` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tax_authority` (
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
CREATE TABLE `tax_exemption` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tax_exemption_reason` VARCHAR(191) NULL,
    `code` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `tax_exemption_type` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tax_group` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tax_group_name` VARCHAR(191) NOT NULL,
    `tax_group_percentage` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_period` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `months` INTEGER NOT NULL,
    `period_number` INTEGER NOT NULL,
    `accounting_period_status` INTEGER NOT NULL,
    `is_current_posting_period` BOOLEAN NOT NULL,
    `is_year_end_closing` BOOLEAN NOT NULL,
    `period_starting_date` DATETIME(3) NOT NULL,
    `period_ending_date` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `journal_type` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `country` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `country_code` VARCHAR(191) NOT NULL,
    `country_name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `title` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `short_code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `language` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `account_type` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `can_be_sub_account` BOOLEAN NULL,
    `contain_account_number` BOOLEAN NULL,
    `contain_currency` BOOLEAN NULL,
    `tool_tip_description` VARCHAR(191) NULL,
    `can_have_more_than_one_chart_of_account` BOOLEAN NULL,
    `account_category_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bank` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `account_type` INTEGER NOT NULL,
    `account_name` VARCHAR(191) NOT NULL,
    `account_number` VARCHAR(191) NULL,
    `account_code` VARCHAR(191) NULL,
    `IBAN` VARCHAR(191) NULL,
    `bank_name` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `is_primary` BOOLEAN NULL,
    `currency_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exchange_rate` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rate` DOUBLE NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `currency_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `financial_settings` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `report_basis` INTEGER NOT NULL,
    `fiscal_year` INTEGER NOT NULL,
    `closing_type` INTEGER NOT NULL,
    `timezone` VARCHAR(191) NULL,
    `company_id` INTEGER NULL,
    `tax_id` INTEGER NULL,
    `tax_id_number` VARCHAR(191) NULL,
    `auto_generate_journal_preference` BOOLEAN NULL,
    `is_acc_code_mandatory` BOOLEAN NULL,
    `enter_unique_acc_code` BOOLEAN NULL,
    `is_profile_tax_applied` BOOLEAN NULL,
    `is_legal_reserve_applied` BOOLEAN NULL,
    `profit_tax` DOUBLE NULL,
    `legal_reserve` DOUBLE NULL,
    `company_id_number` VARCHAR(191) NULL,
    `time_format_id` INTEGER NULL,
    `language_id` INTEGER NULL,
    `base_currency_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `journal_users` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `access_name` INTEGER NULL,
    `user_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chart_of_account` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `account_name` VARCHAR(191) NULL,
    `account_code` VARCHAR(191) NULL,
    `account_number` VARCHAR(191) NULL,
    `is_active` BOOLEAN NULL,
    `description` VARCHAR(191) NULL,
    `add_to_dashboard_watch_list` BOOLEAN NULL,
    `attachment_path` INTEGER NULL,
    `is_sub_account` BOOLEAN NULL,
    `is_default` BOOLEAN NULL,
    `is_employee_account` BOOLEAN NULL,
    `has_opening_balance` BOOLEAN NULL,
    `is_bank_account` BOOLEAN NULL,
    `parent_account_id` INTEGER NULL,
    `head_account_id` INTEGER NULL,
    `currency_id` INTEGER NOT NULL,
    `account_type_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contact_type` INTEGER NOT NULL,
    `company_name` VARCHAR(191) NOT NULL,
    `contact_display_name` VARCHAR(191) NOT NULL,
    `remark` VARCHAR(191) NULL,
    `chart_of_account_id` INTEGER NULL,
    `currency_id` INTEGER NULL,
    `payment_term_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cost_center_accounts` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `remark` VARCHAR(191) NOT NULL,
    `chart_of_account_id` INTEGER NULL,
    `cost_center_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `company_address` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `address1` VARCHAR(191) NOT NULL,
    `address2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state_or_province` VARCHAR(191) NULL,
    `zip_or_portal_code` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `fax` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `organization_profile_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `associated_tax_group` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tax_id` INTEGER NOT NULL,
    `tax_group_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tax` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tax_name` VARCHAR(191) NOT NULL,
    `tax_percentage` DOUBLE NOT NULL,
    `is_value_added` BOOLEAN NULL,
    `is_editable` BOOLEAN NULL,
    `is_default_tax` BOOLEAN NULL,
    `tax_type` INTEGER NULL,
    `chart_of_account_debit_id` INTEGER NULL,
    `chart_of_account_credit_id` INTEGER NULL,
    `tax_authority_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tax_rule` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `operator` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `remark` VARCHAR(191) NULL,
    `sales_type` INTEGER NULL,
    `tax_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_address` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `address_type` INTEGER NOT NULL,
    `attention` VARCHAR(191) NULL,
    `street1` VARCHAR(191) NULL,
    `street2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `fax` VARCHAR(191) NULL,
    `zip_code` VARCHAR(191) NULL,
    `contact_id` INTEGER NULL,
    `country_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_person` (
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `revisionDate` DATETIME(3) NOT NULL,
    `revisedBy` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `isProtectedForEdit` BOOLEAN NOT NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NULL,
    `work_phone` VARCHAR(191) NULL,
    `mobile` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `designation` VARCHAR(191) NULL,
    `department` VARCHAR(191) NULL,
    `is_primary_contact` BOOLEAN NULL,
    `contact_id` INTEGER NULL,
    `title_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `primary_contact` (
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
    `email` VARCHAR(191) NOT NULL,
    `organization_profile_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `account_type` ADD CONSTRAINT `account_type_account_category_id_fkey` FOREIGN KEY (`account_category_id`) REFERENCES `account_category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bank` ADD CONSTRAINT `bank_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currency`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exchange_rate` ADD CONSTRAINT `exchange_rate_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currency`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `financial_settings` ADD CONSTRAINT `financial_settings_base_currency_id_fkey` FOREIGN KEY (`base_currency_id`) REFERENCES `currency`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `financial_settings` ADD CONSTRAINT `financial_settings_time_format_id_fkey` FOREIGN KEY (`time_format_id`) REFERENCES `date_format_type`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `financial_settings` ADD CONSTRAINT `financial_settings_language_id_fkey` FOREIGN KEY (`language_id`) REFERENCES `language`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `journal_users` ADD CONSTRAINT `journal_users_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chart_of_account` ADD CONSTRAINT `chart_of_account_account_type_id_fkey` FOREIGN KEY (`account_type_id`) REFERENCES `account_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chart_of_account` ADD CONSTRAINT `chart_of_account_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currency`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chart_of_account` ADD CONSTRAINT `chart_of_account_parent_account_id_fkey` FOREIGN KEY (`parent_account_id`) REFERENCES `chart_of_account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chart_of_account` ADD CONSTRAINT `chart_of_account_head_account_id_fkey` FOREIGN KEY (`head_account_id`) REFERENCES `chart_of_account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact` ADD CONSTRAINT `contact_chart_of_account_id_fkey` FOREIGN KEY (`chart_of_account_id`) REFERENCES `chart_of_account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact` ADD CONSTRAINT `contact_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currency`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact` ADD CONSTRAINT `contact_payment_term_id_fkey` FOREIGN KEY (`payment_term_id`) REFERENCES `payment_term`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cost_center_accounts` ADD CONSTRAINT `cost_center_accounts_cost_center_id_fkey` FOREIGN KEY (`cost_center_id`) REFERENCES `cost_center`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cost_center_accounts` ADD CONSTRAINT `cost_center_accounts_chart_of_account_id_fkey` FOREIGN KEY (`chart_of_account_id`) REFERENCES `chart_of_account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `company_address` ADD CONSTRAINT `company_address_organization_profile_id_fkey` FOREIGN KEY (`organization_profile_id`) REFERENCES `financial_settings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `associated_tax_group` ADD CONSTRAINT `associated_tax_group_tax_id_fkey` FOREIGN KEY (`tax_id`) REFERENCES `tax`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `associated_tax_group` ADD CONSTRAINT `associated_tax_group_tax_group_id_fkey` FOREIGN KEY (`tax_group_id`) REFERENCES `tax_group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tax` ADD CONSTRAINT `tax_tax_authority_id_fkey` FOREIGN KEY (`tax_authority_id`) REFERENCES `tax_authority`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tax` ADD CONSTRAINT `tax_chart_of_account_debit_id_fkey` FOREIGN KEY (`chart_of_account_debit_id`) REFERENCES `chart_of_account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tax` ADD CONSTRAINT `tax_chart_of_account_credit_id_fkey` FOREIGN KEY (`chart_of_account_credit_id`) REFERENCES `chart_of_account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tax_rule` ADD CONSTRAINT `tax_rule_tax_id_fkey` FOREIGN KEY (`tax_id`) REFERENCES `tax`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact_address` ADD CONSTRAINT `contact_address_contact_id_fkey` FOREIGN KEY (`contact_id`) REFERENCES `contact`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact_address` ADD CONSTRAINT `contact_address_country_id_fkey` FOREIGN KEY (`country_id`) REFERENCES `country`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact_person` ADD CONSTRAINT `contact_person_contact_id_fkey` FOREIGN KEY (`contact_id`) REFERENCES `contact`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact_person` ADD CONSTRAINT `contact_person_title_id_fkey` FOREIGN KEY (`title_id`) REFERENCES `title`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `primary_contact` ADD CONSTRAINT `primary_contact_organization_profile_id_fkey` FOREIGN KEY (`organization_profile_id`) REFERENCES `financial_settings`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
