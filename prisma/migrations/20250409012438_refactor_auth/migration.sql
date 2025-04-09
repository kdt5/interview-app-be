/*
  Warnings:

  - You are about to drop the column `token` on the `RefreshToken` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[hashedToken]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hashedToken` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `RefreshToken_token_idx` ON `RefreshToken`;

-- DropIndex
DROP INDEX `RefreshToken_token_key` ON `RefreshToken`;

-- AlterTable
ALTER TABLE `RefreshToken` DROP COLUMN `token`,
    ADD COLUMN `hashedToken` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `RefreshToken_hashedToken_key` ON `RefreshToken`(`hashedToken`);

-- CreateIndex
CREATE INDEX `RefreshToken_hashedToken_idx` ON `RefreshToken`(`hashedToken`);
