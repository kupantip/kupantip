IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = '$(DatabaseName)')
BEGIN
    CREATE DATABASE [$(DatabaseName)];
	PRINT 'Database $(DatabaseName) created successfully.';
END;
GO

IF EXISTS(SELECT * FROM sys.databases WHERE name = '$(DatabaseName)')
BEGIN
	PRINT 'Using existing database $(DatabaseName).';
	USE [$(DatabaseName)];

	CREATE TABLE [app_user] (
		[id] uniqueidentifier PRIMARY KEY DEFAULT (NEWSEQUENTIALID()),
		[email] nvarchar(320) UNIQUE NOT NULL,
		[handle] nvarchar(32) UNIQUE NOT NULL,
		[display_name] nvarchar(100) NOT NULL,
		[created_at] datetime NOT NULL DEFAULT (GETDATE()),
		[updated_at] datetime NOT NULL DEFAULT (GETDATE())
	)


	CREATE TABLE [user_secret] (
		[user_id] uniqueidentifier PRIMARY KEY,
		[password_hash] nvarchar(255) NOT NULL
	)


	CREATE TABLE [user_role] (
		[user_id] uniqueidentifier NOT NULL,
		[role] nvarchar(32) NOT NULL,
		PRIMARY KEY ([user_id], [role])
	)


	CREATE TABLE [post] (
		[id] uniqueidentifier PRIMARY KEY DEFAULT (NEWSEQUENTIALID()),
		[author_id] uniqueidentifier,
		[title] nvarchar(300) NOT NULL,
		[body_md] nvarchar(max),
		[url] nvarchar(2048),
		[created_at] datetime NOT NULL DEFAULT (GETDATE()),
		[updated_at] datetime NOT NULL DEFAULT (GETDATE()),
		[deleted_at] datetime,
		[category_id] uniqueidentifier
	)


	CREATE TABLE [comment] (
		[id] uniqueidentifier PRIMARY KEY DEFAULT (NEWSEQUENTIALID()),
		[post_id] uniqueidentifier NOT NULL,
		[author_id] uniqueidentifier,
		[parent_id] uniqueidentifier,
		[body_md] nvarchar(max),
		[created_at] datetime NOT NULL DEFAULT (GETDATE()),
		[updated_at] datetime NOT NULL DEFAULT (GETDATE()),
		[deleted_at] datetime
	)


	CREATE TABLE [post_vote] (
		[post_id] uniqueidentifier NOT NULL,
		[user_id] uniqueidentifier NOT NULL,
		[value] smallint NOT NULL,
		[created_at] datetime NOT NULL DEFAULT (GETDATE()),
		PRIMARY KEY ([post_id], [user_id])
	)


	CREATE TABLE [comment_vote] (
		[comment_id] uniqueidentifier NOT NULL,
		[user_id] uniqueidentifier NOT NULL,
		[value] smallint NOT NULL,
		[created_at] datetime NOT NULL DEFAULT (GETDATE()),
		PRIMARY KEY ([comment_id], [user_id])
	)


	CREATE TABLE [category] (
		[id] uniqueidentifier PRIMARY KEY DEFAULT (NEWSEQUENTIALID()),
		[label] nvarchar(64) NOT NULL,
		[color_hex] varchar(7)
	)


	CREATE TABLE [attachment] (
		[id] uniqueidentifier PRIMARY KEY DEFAULT (NEWSEQUENTIALID()),
		[post_id] uniqueidentifier NOT NULL,
		[url] nvarchar(2048) NOT NULL,
		[mime_type] nvarchar(255),
		[created_at] datetime NOT NULL DEFAULT (GETDATE())
	)


	CREATE TABLE [report] (
		[id] uniqueidentifier PRIMARY KEY DEFAULT (NEWSEQUENTIALID()),
		[target_type] nvarchar(16) NOT NULL,
		[target_id] uniqueidentifier NOT NULL,
		[reporter_id] uniqueidentifier NOT NULL,
		[reason] nvarchar(max) NOT NULL,
		[created_at] datetime NOT NULL DEFAULT (GETDATE()),
		[status] nvarchar(16) NOT NULL DEFAULT 'open'
	)


	-- CREATE INDEX [post_index_0] ON [post] ("created_at")


	-- CREATE INDEX [post_index_1] ON [post] ("author_id", "created_at")


	-- CREATE INDEX [comment_index_2] ON [comment] ("post_id", "parent_id", "created_at")


	ALTER TABLE [user_secret] ADD FOREIGN KEY ([user_id]) REFERENCES [app_user] ([id])


	ALTER TABLE [user_role] ADD FOREIGN KEY ([user_id]) REFERENCES [app_user] ([id])


	ALTER TABLE [post] ADD FOREIGN KEY ([author_id]) REFERENCES [app_user] ([id])


	ALTER TABLE [post] ADD FOREIGN KEY ([category_id]) REFERENCES [category] ([id])


	ALTER TABLE [comment] ADD FOREIGN KEY ([post_id]) REFERENCES [post] ([id])


	ALTER TABLE [comment] ADD FOREIGN KEY ([author_id]) REFERENCES [app_user] ([id])


	ALTER TABLE [comment] ADD FOREIGN KEY ([parent_id]) REFERENCES [comment] ([id])


	ALTER TABLE [post_vote] ADD FOREIGN KEY ([post_id]) REFERENCES [post] ([id])


	ALTER TABLE [post_vote] ADD FOREIGN KEY ([user_id]) REFERENCES [app_user] ([id])


	ALTER TABLE [comment_vote] ADD FOREIGN KEY ([comment_id]) REFERENCES [comment] ([id])


	ALTER TABLE [comment_vote] ADD FOREIGN KEY ([user_id]) REFERENCES [app_user] ([id])


	ALTER TABLE [attachment] ADD FOREIGN KEY ([post_id]) REFERENCES [post] ([id])


	ALTER TABLE [report] ADD FOREIGN KEY ([reporter_id]) REFERENCES [app_user] ([id])

	PRINT 'Tables created successfully.';
	-- Create SQL user and assign roles

	IF NOT EXISTS (SELECT * FROM sys.sql_logins WHERE name = '$(SQL_USER)')
	BEGIN
		CREATE LOGIN [$(SQL_USER)] WITH PASSWORD = '$(SQL_PASSWORD)', CHECK_POLICY = ON;
	END;



	IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = '$(SQL_USER)')
	BEGIN
		CREATE USER [$(SQL_USER)] FOR LOGIN [$(SQL_USER)];
	END;



	EXEC sp_addrolemember 'db_datareader', '$(SQL_USER)';
	EXEC sp_addrolemember 'db_datawriter', '$(SQL_USER)';
	PRINT 'User $(SQL_USER) created and roles assigned successfully.';
END;
GO
