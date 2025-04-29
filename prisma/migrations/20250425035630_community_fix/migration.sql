-- CreateIndex
CREATE INDEX `Answer_created_at_idx` ON `Answer`(`created_at`);

-- CreateIndex
CREATE INDEX `Answer_user_id_created_at_idx` ON `Answer`(`user_id`, `created_at`);

-- CreateIndex
CREATE INDEX `Answer_user_id_favorite_count_idx` ON `Answer`(`user_id`, `favorite_count`);

-- CreateIndex
CREATE INDEX `Comment_created_at_idx` ON `Comment`(`created_at`);

-- CreateIndex
CREATE INDEX `Comment_user_id_created_at_idx` ON `Comment`(`user_id`, `created_at`);

-- CreateIndex
CREATE INDEX `Comment_user_id_favorite_count_idx` ON `Comment`(`user_id`, `favorite_count`);

-- CreateIndex
CREATE INDEX `CommunityPost_user_id_created_at_idx` ON `CommunityPost`(`user_id`, `created_at`);

-- CreateIndex
CREATE INDEX `CommunityPost_user_id_favorite_count_idx` ON `CommunityPost`(`user_id`, `favorite_count`);
