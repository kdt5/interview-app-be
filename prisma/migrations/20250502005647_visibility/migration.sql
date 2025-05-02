/*
  Warnings:

  - A unique constraint covering the columns `[user_id,question_id]` on the table `Answer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Answer` ADD COLUMN `visibility` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `Answer_visibility_idx` ON `Answer`(`visibility`);

-- CreateIndex
CREATE UNIQUE INDEX `Answer_user_id_question_id_key` ON `Answer`(`user_id`, `question_id`);
