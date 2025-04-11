-- AlterTable
ALTER TABLE `Answer` ADD COLUMN `answer_like_count` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `AnswerLike` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `Comment` ADD COLUMN `comment_like_count` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `CommentLike` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `CommunityPost` ADD COLUMN `community_post_like_count` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `CommunityPostLike` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
