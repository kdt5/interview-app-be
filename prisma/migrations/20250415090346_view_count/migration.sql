/*
  Warnings:

  - You are about to drop the column `answer_like_count` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `comment_like_count` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `community_post_like_count` on the `CommunityPost` table. All the data in the column will be lost.
  - You are about to drop the column `question_id` on the `Favorite` table. All the data in the column will be lost.
  - You are about to drop the `AnswerLike` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CommentLike` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CommunityPostLike` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[target_type,target_id,user_id]` on the table `Favorite` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `target_id` to the `Favorite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `target_type` to the `Favorite` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `AnswerLike` DROP FOREIGN KEY `AnswerLike_answer_id_fkey`;

-- DropForeignKey
ALTER TABLE `AnswerLike` DROP FOREIGN KEY `AnswerLike_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `CommentLike` DROP FOREIGN KEY `CommentLike_comment_id_fkey`;

-- DropForeignKey
ALTER TABLE `CommentLike` DROP FOREIGN KEY `CommentLike_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `CommunityPostLike` DROP FOREIGN KEY `CommunityPostLike_post_id_fkey`;

-- DropForeignKey
ALTER TABLE `CommunityPostLike` DROP FOREIGN KEY `CommunityPostLike_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Favorite` DROP FOREIGN KEY `Favorite_question_id_fkey`;

-- DropForeignKey
ALTER TABLE `Favorite` DROP FOREIGN KEY `Favorite_user_id_fkey`;

-- DropIndex
DROP INDEX `Favorite_question_id_fkey` ON `Favorite`;

-- DropIndex
DROP INDEX `Favorite_user_id_question_id_idx` ON `Favorite`;

-- DropIndex
DROP INDEX `Favorite_user_id_question_id_key` ON `Favorite`;

-- AlterTable
ALTER TABLE `Answer` DROP COLUMN `answer_like_count`,
    ADD COLUMN `favorite_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `view_count` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Comment` DROP COLUMN `comment_like_count`,
    ADD COLUMN `favorite_count` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `CommunityPost` DROP COLUMN `community_post_like_count`,
    ADD COLUMN `favorite_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `view_count` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Favorite` DROP COLUMN `question_id`,
    ADD COLUMN `target_id` INTEGER NOT NULL,
    ADD COLUMN `target_type` ENUM('QUESTION', 'POST', 'ANSWER', 'COMMENT') NOT NULL;

-- AlterTable
ALTER TABLE `Question` ADD COLUMN `favorite_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `view_count` INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE `AnswerLike`;

-- DropTable
DROP TABLE `CommentLike`;

-- DropTable
DROP TABLE `CommunityPostLike`;

-- CreateIndex
CREATE INDEX `Favorite_user_id_idx` ON `Favorite`(`user_id`);

-- CreateIndex
CREATE INDEX `Favorite_target_type_target_id_idx` ON `Favorite`(`target_type`, `target_id`);

-- CreateIndex
CREATE UNIQUE INDEX `Favorite_target_type_target_id_user_id_key` ON `Favorite`(`target_type`, `target_id`, `user_id`);
