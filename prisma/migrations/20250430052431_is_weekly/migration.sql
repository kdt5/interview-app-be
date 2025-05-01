/*
  Warnings:

  - You are about to drop the column `is_weekly` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Question` DROP COLUMN `is_weekly`;

-- CreateIndex
CREATE INDEX `Answer_user_id_fkey` ON `Answer`(`user_id`);

-- CreateIndex
CREATE INDEX `Comment_user_id_fkey` ON `Comment`(`user_id`);
