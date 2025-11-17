BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[requested_category] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [DF__requested_category__id] DEFAULT newsequentialid(),
    [requester_id] UNIQUEIDENTIFIER NOT NULL,
    [label] NVARCHAR(64) NOT NULL,
    [color_hex] VARCHAR(7),
    [detail] NVARCHAR(max),
    [status] NVARCHAR(16) NOT NULL CONSTRAINT [DF__requested_category__status] DEFAULT 'open',
    [created_at] DATETIME NOT NULL CONSTRAINT [DF__requested_category__created_at] DEFAULT CURRENT_TIMESTAMP,
    [reviewed_at] DATETIME,
    [reviewed_by] UNIQUEIDENTIFIER,
    CONSTRAINT [PK__requested_category__3213E83F] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [requested_category_index_1] ON [dbo].[requested_category]([requester_id], [status], [created_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [requested_category_index_2] ON [dbo].[requested_category]([status], [created_at]);

-- AddForeignKey
ALTER TABLE [dbo].[requested_category] ADD CONSTRAINT [FK__requested_category__requester] FOREIGN KEY ([requester_id]) REFERENCES [dbo].[app_user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[requested_category] ADD CONSTRAINT [FK__requested_category__reviewer] FOREIGN KEY ([reviewed_by]) REFERENCES [dbo].[app_user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
