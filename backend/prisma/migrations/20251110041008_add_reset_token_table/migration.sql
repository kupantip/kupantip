BEGIN TRY

BEGIN TRAN;

-- AlterTable
EXEC SP_RENAME N'dbo.PK__app_user__3213E83FC82FB4AF', N'PK__app_user__3213E83F9FE66E99';

-- AlterTable
EXEC SP_RENAME N'dbo.PK__attachme__3213E83FF060078B', N'PK__attachme__3213E83FD8441BBC';

-- AlterTable
EXEC SP_RENAME N'dbo.PK__category__3213E83F84440C4D', N'PK__category__3213E83F88272325';

-- AlterTable
EXEC SP_RENAME N'dbo.PK__comment__3213E83FF74471FB', N'PK__comment__3213E83FBB03BA90';

-- AlterTable
EXEC SP_RENAME N'dbo.PK__comment___0C0E95F7CB1F91BD', N'PK__comment___0C0E95F794FDB49B';

-- AlterTable
EXEC SP_RENAME N'dbo.PK__moderati__3213E83F16C9F4CE', N'PK__moderati__3213E83F1536CC02';

-- AlterTable
EXEC SP_RENAME N'dbo.PK__post__3213E83FC621AFCE', N'PK__post__3213E83F66784A2C';

-- AlterTable
EXEC SP_RENAME N'dbo.PK__post_vot__D54C64165658456C', N'PK__post_vot__D54C641638BAFC0E';

-- AlterTable
EXEC SP_RENAME N'dbo.PK__report__3213E83F9893DB22', N'PK__report__3213E83F4A77CD7D';

-- AlterTable
EXEC SP_RENAME N'dbo.PK__user_ban__3213E83F4C275822', N'PK__user_ban__3213E83FDABA7A89';

-- AlterTable
EXEC SP_RENAME N'dbo.PK__user_rol__31DDE51B735CAF6C', N'PK__user_rol__31DDE51B1CEFBACD';

-- AlterTable
EXEC SP_RENAME N'dbo.PK__user_sec__B9BE370F1DC66A08', N'PK__user_sec__B9BE370F85E12DA3';

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
    [create_at] DATETIME NOT NULL CONSTRAINT [DF__reset_tok__creat__6A30C649] DEFAULT CURRENT_TIMESTAMP,
    [isValid] BIT NOT NULL CONSTRAINT [DF__reset_tok__isVal__6B24EA82] DEFAULT 0,
    CONSTRAINT [PK__reset_to__3213E83F348BCA43] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[announcement] ADD CONSTRAINT [FK__announcem__autho__7C4F7684] FOREIGN KEY ([author_id]) REFERENCES [dbo].[app_user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[reset_token] ADD CONSTRAINT [FK__reset_tok__user___7D439ABD] FOREIGN KEY ([user_id]) REFERENCES [dbo].[app_user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- RenameIndex
EXEC SP_RENAME N'dbo.app_user.UQ__app_user__7ED567C02725D883', N'UQ__app_user__7ED567C0A5DC2FD7', N'INDEX';

-- RenameIndex
EXEC SP_RENAME N'dbo.app_user.UQ__app_user__AB6E61641C100918', N'UQ__app_user__AB6E61647535C41D', N'INDEX';

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
