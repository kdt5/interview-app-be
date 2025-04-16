/*
  Warnings:

  - Added the required column `post_category_id` to the `CommunityPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `CommunityPost` ADD COLUMN `post_category_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `CommunityPostCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `CommunityPostCategory_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `CommunityPost_post_category_id_idx` ON `CommunityPost`(`post_category_id`);

-- CreateIndex
CREATE INDEX `CommunityPost_created_at_idx` ON `CommunityPost`(`created_at`);

-- AddForeignKey
ALTER TABLE `CommunityPost` ADD CONSTRAINT `CommunityPost_post_category_id_fkey` FOREIGN KEY (`post_category_id`) REFERENCES `CommunityPostCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RedefineIndex
CREATE INDEX `CommunityPost_user_id_idx` ON `CommunityPost`(`user_id`);
DROP INDEX `CommunityPost_user_id_fkey` ON `CommunityPost`;
