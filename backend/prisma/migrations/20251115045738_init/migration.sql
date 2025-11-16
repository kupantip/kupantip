BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[app_user] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [DF__app_user__id__398D8EEE] DEFAULT newsequentialid(),
    [email] NVARCHAR(320) NOT NULL,
    [handle] NVARCHAR(32) NOT NULL,
    [display_name] NVARCHAR(100) NOT NULL,
    [created_at] DATETIME NOT NULL CONSTRAINT [DF__app_user__create__3A81B327] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME NOT NULL CONSTRAINT [DF__app_user__update__3B75D760] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PK__app_user__3213E83F9FE66E99] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UQ__app_user__AB6E61647535C41D] UNIQUE NONCLUSTERED ([email]),
    CONSTRAINT [UQ__app_user__7ED567C0A5DC2FD7] UNIQUE NONCLUSTERED ([handle])
);

-- CreateTable
CREATE TABLE [dbo].[attachment] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [DF__attachment__id__5441852A] DEFAULT newsequentialid(),
    [post_id] UNIQUEIDENTIFIER NOT NULL,
    [url] NVARCHAR(2048) NOT NULL,
    [mime_type] NVARCHAR(255),
    [created_at] DATETIME NOT NULL CONSTRAINT [DF__attachmen__creat__5535A963] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PK__attachme__3213E83FD8441BBC] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[category] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [DF__category__id__5165187F] DEFAULT newsequentialid(),
    [label] NVARCHAR(64) NOT NULL,
    [color_hex] VARCHAR(7),
    CONSTRAINT [PK__category__3213E83F88272325] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[comment] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [DF__comment__id__46E78A0C] DEFAULT newsequentialid(),
    [post_id] UNIQUEIDENTIFIER NOT NULL,
    [author_id] UNIQUEIDENTIFIER,
    [parent_id] UNIQUEIDENTIFIER,
    [body_md] NVARCHAR(max),
    [created_at] DATETIME NOT NULL CONSTRAINT [DF__comment__created__47DBAE45] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME NOT NULL CONSTRAINT [DF__comment__updated__48CFD27E] DEFAULT CURRENT_TIMESTAMP,
    [deleted_at] DATETIME,
    CONSTRAINT [PK__comment__3213E83FBB03BA90] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[comment_vote] (
    [comment_id] UNIQUEIDENTIFIER NOT NULL,
    [user_id] UNIQUEIDENTIFIER NOT NULL,
    [value] SMALLINT NOT NULL,
    [created_at] DATETIME NOT NULL CONSTRAINT [DF__comment_v__creat__4E88ABD4] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PK__comment___0C0E95F794FDB49B] PRIMARY KEY CLUSTERED ([comment_id],[user_id])
);

-- CreateTable
CREATE TABLE [dbo].[post] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [DF__post__id__4222D4EF] DEFAULT newsequentialid(),
    [author_id] UNIQUEIDENTIFIER,
    [title] NVARCHAR(300) NOT NULL,
    [body_md] NVARCHAR(max),
    [url] NVARCHAR(2048),
    [created_at] DATETIME NOT NULL CONSTRAINT [DF__post__created_at__4316F928] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME NOT NULL CONSTRAINT [DF__post__updated_at__440B1D61] DEFAULT CURRENT_TIMESTAMP,
    [deleted_at] DATETIME,
    [category_id] UNIQUEIDENTIFIER,
    CONSTRAINT [PK__post__3213E83F66784A2C] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[post_vote] (
    [post_id] UNIQUEIDENTIFIER NOT NULL,
    [user_id] UNIQUEIDENTIFIER NOT NULL,
    [value] SMALLINT NOT NULL,
    [created_at] DATETIME NOT NULL CONSTRAINT [DF__post_vote__creat__4BAC3F29] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PK__post_vot__D54C641638BAFC0E] PRIMARY KEY CLUSTERED ([post_id],[user_id])
);

-- CreateTable
CREATE TABLE [dbo].[report] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [DF__report__id__5812160E] DEFAULT newsequentialid(),
    [target_type] NVARCHAR(16) NOT NULL,
    [target_id] UNIQUEIDENTIFIER NOT NULL,
    [reporter_id] UNIQUEIDENTIFIER NOT NULL,
    [reason] NVARCHAR(max) NOT NULL,
    [created_at] DATETIME NOT NULL CONSTRAINT [DF__report__created___59063A47] DEFAULT CURRENT_TIMESTAMP,
    [status] NVARCHAR(16) NOT NULL CONSTRAINT [DF__report__status__59FA5E80] DEFAULT 'open',
    CONSTRAINT [PK__report__3213E83F4A77CD7D] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[user_role] (
    [user_id] UNIQUEIDENTIFIER NOT NULL,
    [role] NVARCHAR(32) NOT NULL,
    CONSTRAINT [PK__user_rol__31DDE51B1CEFBACD] PRIMARY KEY CLUSTERED ([user_id],[role])
);

-- CreateTable
CREATE TABLE [dbo].[user_secret] (
    [user_id] UNIQUEIDENTIFIER NOT NULL,
    [password_hash] NVARCHAR(255) NOT NULL,
    CONSTRAINT [PK__user_sec__B9BE370F85E12DA3] PRIMARY KEY CLUSTERED ([user_id])
);

-- CreateTable
CREATE TABLE [dbo].[moderation_action] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [DF__moderation_a__id__619B8048] DEFAULT newsequentialid(),
    [actor_id] UNIQUEIDENTIFIER NOT NULL,
    [target_type] NVARCHAR(16) NOT NULL,
    [target_id] UNIQUEIDENTIFIER NOT NULL,
    [action_type] NVARCHAR(32) NOT NULL,
    [details] NVARCHAR(max),
    [created_at] DATETIME NOT NULL CONSTRAINT [DF__moderatio__creat__628FA481] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PK__moderati__3213E83F1536CC02] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[user_ban] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [DF__user_ban__id__5CD6CB2B] DEFAULT newsequentialid(),
    [user_id] UNIQUEIDENTIFIER NOT NULL,
    [ban_type] NVARCHAR(32) NOT NULL,
    [reason_admin] NVARCHAR(max),
    [reason_user] NVARCHAR(512),
    [start_at] DATETIME NOT NULL CONSTRAINT [DF__user_ban__start___5DCAEF64] DEFAULT CURRENT_TIMESTAMP,
    [end_at] DATETIME,
    [created_by] UNIQUEIDENTIFIER,
    [created_at] DATETIME NOT NULL CONSTRAINT [DF__user_ban__create__5EBF139D] DEFAULT CURRENT_TIMESTAMP,
    [revoked_at] DATETIME,
    [revoked_by] UNIQUEIDENTIFIER,
    [related_report_id] UNIQUEIDENTIFIER,
    CONSTRAINT [PK__user_ban__3213E83FDABA7A89] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[announcement] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [DF__announcement__id__656C112C] DEFAULT newsequentialid(),
    [author_id] UNIQUEIDENTIFIER NOT NULL,
    [title] NVARCHAR(300) NOT NULL,
    [body_md] NVARCHAR(max) NOT NULL,
    [create_at] DATETIME NOT NULL CONSTRAINT [DF__announcem__creat__66603565] DEFAULT CURRENT_TIMESTAMP,
    [start_at] DATETIME NOT NULL,
    [end_at] DATETIME NOT NULL,
    [delete_at] DATETIME,
    CONSTRAINT [PK__announce__3213E83F24BAF726] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[reset_token] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [DF__reset_token__id__693CA210] DEFAULT newsequentialid(),
    [user_id] UNIQUEIDENTIFIER NOT NULL,
    [token] NVARCHAR(max) NOT NULL,
    [create_at] DATETIME NOT NULL CONSTRAINT [DF__reset_tok__creat__6A30C649] DEFAULT CURRENT_TIMESTAMP,
    [isValid] BIT NOT NULL CONSTRAINT [DF__reset_tok__isVal__6B24EA82] DEFAULT 1,
    CONSTRAINT [PK__reset_to__3213E83F348BCA43] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [comment_index_2] ON [dbo].[comment]([post_id], [parent_id], [created_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [post_index_0] ON [dbo].[post]([created_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [post_index_1] ON [dbo].[post]([author_id], [created_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [moderation_action_index_6] ON [dbo].[moderation_action]([actor_id], [created_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [moderation_action_index_7] ON [dbo].[moderation_action]([target_type], [target_id], [created_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [user_ban_index_3] ON [dbo].[user_ban]([user_id], [ban_type], [start_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [user_ban_index_4] ON [dbo].[user_ban]([end_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [user_ban_index_5] ON [dbo].[user_ban]([revoked_at]);

-- AddForeignKey
ALTER TABLE [dbo].[attachment] ADD CONSTRAINT [FK__attachmen__post___656C112C] FOREIGN KEY ([post_id]) REFERENCES [dbo].[post]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[comment] ADD CONSTRAINT [FK__comment__author___5FB337D6] FOREIGN KEY ([author_id]) REFERENCES [dbo].[app_user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[comment] ADD CONSTRAINT [FK__comment__parent___60A75C0F] FOREIGN KEY ([parent_id]) REFERENCES [dbo].[comment]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[comment] ADD CONSTRAINT [FK__comment__post_id__5EBF139D] FOREIGN KEY ([post_id]) REFERENCES [dbo].[post]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[comment_vote] ADD CONSTRAINT [FK__comment_v__comme__6383C8BA] FOREIGN KEY ([comment_id]) REFERENCES [dbo].[comment]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[comment_vote] ADD CONSTRAINT [FK__comment_v__user___6477ECF3] FOREIGN KEY ([user_id]) REFERENCES [dbo].[app_user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[post] ADD CONSTRAINT [FK__post__author_id__5CD6CB2B] FOREIGN KEY ([author_id]) REFERENCES [dbo].[app_user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[post] ADD CONSTRAINT [FK__post__category_i__5DCAEF64] FOREIGN KEY ([category_id]) REFERENCES [dbo].[category]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[post_vote] ADD CONSTRAINT [FK__post_vote__post___619B8048] FOREIGN KEY ([post_id]) REFERENCES [dbo].[post]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[post_vote] ADD CONSTRAINT [FK__post_vote__user___628FA481] FOREIGN KEY ([user_id]) REFERENCES [dbo].[app_user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[report] ADD CONSTRAINT [FK__report__reporter__66603565] FOREIGN KEY ([reporter_id]) REFERENCES [dbo].[app_user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[user_role] ADD CONSTRAINT [FK__user_role__user___5BE2A6F2] FOREIGN KEY ([user_id]) REFERENCES [dbo].[app_user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[user_secret] ADD CONSTRAINT [FK__user_secr__user___5AEE82B9] FOREIGN KEY ([user_id]) REFERENCES [dbo].[app_user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[moderation_action] ADD CONSTRAINT [FK__moderatio__actor__72C60C4A] FOREIGN KEY ([actor_id]) REFERENCES [dbo].[app_user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[user_ban] ADD CONSTRAINT [FK__user_ban__create__70DDC3D8] FOREIGN KEY ([created_by]) REFERENCES [dbo].[app_user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[user_ban] ADD CONSTRAINT [FK__user_ban__revoke__71D1E811] FOREIGN KEY ([revoked_by]) REFERENCES [dbo].[app_user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[user_ban] ADD CONSTRAINT [FK__user_ban__user_i__6FE99F9F] FOREIGN KEY ([user_id]) REFERENCES [dbo].[app_user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[announcement] ADD CONSTRAINT [FK__announcem__autho__7C4F7684] FOREIGN KEY ([author_id]) REFERENCES [dbo].[app_user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[reset_token] ADD CONSTRAINT [FK__reset_tok__user___7D439ABD] FOREIGN KEY ([user_id]) REFERENCES [dbo].[app_user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
