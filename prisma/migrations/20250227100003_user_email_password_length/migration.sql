/*
  Warnings:

  - You are about to alter the column `password` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(60)`.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `email` VARCHAR(254) NOT NULL,
    MODIFY `password` VARCHAR(60) NOT NULL;
