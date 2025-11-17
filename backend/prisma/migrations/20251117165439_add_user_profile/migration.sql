-- CreateTable
CREATE TABLE [dbo].[user_profile] (
    [user_id] UNIQUEIDENTIFIER NOT NULL,
    [bio] NVARCHAR(500),
    [interests] NVARCHAR(MAX),
    [skills] NVARCHAR(MAX),
    [created_at] DATETIME NOT NULL CONSTRAINT [DF__user_profile__created_at] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME NOT NULL CONSTRAINT [DF__user_profile__updated_at] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PK__user_profile__B9BE370F] PRIMARY KEY CLUSTERED ([user_id])
);

-- AddForeignKey
ALTER TABLE [dbo].[user_profile] ADD CONSTRAINT [FK__user_profile__user_id] FOREIGN KEY ([user_id]) REFERENCES [dbo].[app_user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
