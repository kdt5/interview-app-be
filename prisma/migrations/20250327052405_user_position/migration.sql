/*
  Warnings:

  - The values [backend,frontend] on the enum `Category_position` will be removed. If these variants are still used in the database, this will fail.

*/
-- 기존 데이터 변환
UPDATE `Category` SET `position` = 'BackendDeveloper' WHERE `position` = 'backend';
UPDATE `Category` SET `position` = 'FrontendDeveloper' WHERE `position` = 'frontend';

-- 그 다음 enum 변경
ALTER TABLE `Category` MODIFY `position` ENUM('BackendDeveloper', 'FrontendDeveloper', 'FullStackDeveloper', 'UXUIDesigner', 'DataEngineer', 'DataScientist', 'MobileDeveloper', 'GameDeveloper', 'DevOpsEngineer', 'SecurityEngineer', 'MLEngineer', 'AIResearcher', 'EmbeddedDeveloper', 'BlockchainDeveloper') NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `position` ENUM('BackendDeveloper', 'FrontendDeveloper', 'FullStackDeveloper', 'UXUIDesigner', 'DataEngineer', 'DataScientist', 'MobileDeveloper', 'GameDeveloper', 'DevOpsEngineer', 'SecurityEngineer', 'MLEngineer', 'AIResearcher', 'EmbeddedDeveloper', 'BlockchainDeveloper') NULL;
