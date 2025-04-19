/*
  Warnings:

  - A unique constraint covering the columns `[profile_image_url]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `profile_image_url` VARCHAR(254) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_profile_image_url_key` ON `User`(`profile_image_url`);
