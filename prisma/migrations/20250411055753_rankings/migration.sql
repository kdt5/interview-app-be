-- CreateTable
CREATE TABLE `AnswerLike` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `answer_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,

    INDEX `AnswerLike_user_id_answer_id_idx`(`user_id`, `answer_id`),
    INDEX `AnswerLike_answer_id_fkey`(`answer_id`),
    INDEX `AnswerLike_user_id_fkey`(`user_id`),
    UNIQUE INDEX `AnswerLike_user_id_answer_id_key`(`user_id`, `answer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CommunityPostLike` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,

    INDEX `CommunityPostLike_user_id_post_id_idx`(`user_id`, `post_id`),
    INDEX `CommunityPostLike_post_id_fkey`(`post_id`),
    INDEX `CommunityPostLike_user_id_fkey`(`user_id`),
    UNIQUE INDEX `CommunityPostLike_user_id_post_id_key`(`user_id`, `post_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CommentLike` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `comment_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,

    INDEX `CommentLike_user_id_comment_id_idx`(`user_id`, `comment_id`),
    INDEX `CommentLike_comment_id_fkey`(`comment_id`),
    INDEX `CommentLike_user_id_fkey`(`user_id`),
    UNIQUE INDEX `CommentLike_user_id_comment_id_key`(`user_id`, `comment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AnswerLike` ADD CONSTRAINT `AnswerLike_answer_id_fkey` FOREIGN KEY (`answer_id`) REFERENCES `Answer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnswerLike` ADD CONSTRAINT `AnswerLike_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommunityPostLike` ADD CONSTRAINT `CommunityPostLike_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `CommunityPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommunityPostLike` ADD CONSTRAINT `CommunityPostLike_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommentLike` ADD CONSTRAINT `CommentLike_comment_id_fkey` FOREIGN KEY (`comment_id`) REFERENCES `Comment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommentLike` ADD CONSTRAINT `CommentLike_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
