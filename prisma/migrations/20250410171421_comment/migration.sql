/*
  Warnings:

  - You are about to drop the column `answer_id` on the `Comment` table. All the data in the column will be lost.
  - Added the required column `post_id` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Comment` DROP FOREIGN KEY `Comment_answer_id_fkey`;

-- DropIndex
DROP INDEX `Comment_answer_id_fkey` ON `Comment`;

-- AlterTable
ALTER TABLE `Comment` DROP COLUMN `answer_id`,
    ADD COLUMN `category_id` INTEGER NULL,
    ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `parent_id` INTEGER NULL,
    ADD COLUMN `post_id` INTEGER NOT NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `CommentCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `CommentCategory_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Comment_parent_id_fkey` ON `Comment`(`parent_id`);

-- CreateIndex
CREATE INDEX `Comment_category_id_fkey` ON `Comment`(`category_id`);

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `CommentCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `Comment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
