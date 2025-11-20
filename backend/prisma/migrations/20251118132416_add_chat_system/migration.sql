-- CreateTable
CREATE TABLE [dbo].[chat_room] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [DF__chat_room__id] DEFAULT newsequentialid(),
    [name] NVARCHAR(100),
    [is_group] BIT NOT NULL CONSTRAINT [DF__chat_room__is_group] DEFAULT 0,
    [created_at] DATETIME NOT NULL CONSTRAINT [DF__chat_room__created_at] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME NOT NULL CONSTRAINT [DF__chat_room__updated_at] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PK__chat_room__3213E83F] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[chat_participant] (
    [room_id] UNIQUEIDENTIFIER NOT NULL,
    [user_id] UNIQUEIDENTIFIER NOT NULL,
    [joined_at] DATETIME NOT NULL CONSTRAINT [DF__chat_participant__joined_at] DEFAULT CURRENT_TIMESTAMP,
    [last_read] DATETIME,
    CONSTRAINT [PK__chat_participant] PRIMARY KEY CLUSTERED ([room_id], [user_id])
);

-- CreateTable
CREATE TABLE [dbo].[chat_message] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [DF__chat_message__id] DEFAULT newsequentialid(),
    [room_id] UNIQUEIDENTIFIER NOT NULL,
    [sender_id] UNIQUEIDENTIFIER NOT NULL,
    [content] NVARCHAR(MAX) NOT NULL,
    [created_at] DATETIME NOT NULL CONSTRAINT [DF__chat_message__created_at] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PK__chat_message__3213E83F] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [chat_message_index_1] ON [dbo].[chat_message]([room_id], [created_at]);

-- AddForeignKey
ALTER TABLE [dbo].[chat_participant] ADD CONSTRAINT [FK__chat_participant__room] FOREIGN KEY ([room_id]) REFERENCES [dbo].[chat_room]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[chat_participant] ADD CONSTRAINT [FK__chat_participant__user] FOREIGN KEY ([user_id]) REFERENCES [dbo].[app_user]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[chat_message] ADD CONSTRAINT [FK__chat_message__room] FOREIGN KEY ([room_id]) REFERENCES [dbo].[chat_room]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[chat_message] ADD CONSTRAINT [FK__chat_message__sender] FOREIGN KEY ([sender_id]) REFERENCES [dbo].[app_user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
