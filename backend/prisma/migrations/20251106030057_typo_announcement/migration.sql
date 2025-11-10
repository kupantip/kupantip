/*
  Warnings:

  - You are about to drop the `annoucement` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[annoucement] DROP CONSTRAINT [FK__annouceme__autho__778AC167];

-- DropTable
DROP TABLE [dbo].[annoucement];

-- CreateTable
CREATE TABLE [dbo].[announcement] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [DF__announcement__id__656C112C] DEFAULT newsequentialid(),
    [author_id] UNIQUEIDENTIFIER NOT NULL,
    [title] NVARCHAR(300) NOT NULL,
    [body_md] NVARCHAR(max) NOT NULL,
    [create_at] DATETIME NOT NULL CONSTRAINT [DF__announceme__creat__66603565] DEFAULT CURRENT_TIMESTAMP,
    [start_at] DATETIME NOT NULL,
    [end_at] DATETIME NOT NULL,
    [delete_at] DATETIME,
    CONSTRAINT [PK__announcem__3213E83FC1741333] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[announcement] ADD CONSTRAINT [FK__announceme__autho__778AC167] FOREIGN KEY ([author_id]) REFERENCES [dbo].[app_user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
