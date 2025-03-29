/*
  Warnings:

  - You are about to drop the column `position` on the `Category` table. All the data in the column will be lost.
  - Added the required column `position_id` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE `Position` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Position_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 기본 Position 데이터 삽입
INSERT INTO `Position` (`id`, `code`, `name`, `description`, `order`, `created_at`, `updated_at`)
VALUES 
  (1, 'BACKEND_DEVELOPER', '백엔드 개발자', '서버 개발을 담당하는 개발자입니다.', 1, NOW(), NOW()),
  (2, 'FRONTEND_DEVELOPER', '프론트엔드 개발자', '웹 클라이언트 개발을 담당하는 개발자입니다.', 2, NOW(), NOW()),
  (3, 'FULLSTACK_DEVELOPER', '풀스택 개발자', '프론트엔드와 백엔드 개발을 모두 담당하는 개발자입니다.', 3, NOW(), NOW()),
  (4, 'UXUI_DESIGNER', 'UXUI 디자이너', '사용자 경험과 인터페이스를 디자인하는 디자이너입니다.', 4, NOW(), NOW());

-- Category 테이블에 position_id 컬럼 추가
ALTER TABLE `Category` ADD COLUMN `position_id` INTEGER NULL;

-- Category 테이블의 position_id 업데이트
UPDATE Category SET position_id = 1 WHERE position = 'backend';
UPDATE Category SET position_id = 2 WHERE position = 'frontend';

-- Category 테이블의 position_id를 NOT NULL로 변경
ALTER TABLE `Category` MODIFY COLUMN `position_id` INTEGER NOT NULL;

-- Category 테이블의 position 컬럼 삭제
ALTER TABLE `Category` DROP COLUMN `position`;

-- User 테이블에 position_id 컬럼 추가
ALTER TABLE `User` ADD COLUMN `position_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_position_id_fkey` FOREIGN KEY (`position_id`) REFERENCES `Position`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Category` ADD CONSTRAINT `Category_position_id_fkey` FOREIGN KEY (`position_id`) REFERENCES `Position`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddIndex
CREATE INDEX `Category_position_id_idx` ON `Category`(`position_id`);
