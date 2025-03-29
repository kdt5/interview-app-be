-- CreateTable
CREATE TABLE `WeeklyQuestion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `startDate` DATETIME(3) NOT NULL,

    UNIQUE INDEX `WeeklyQuestion_startDate_key`(`startDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
