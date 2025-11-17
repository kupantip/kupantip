import { getDbConnection } from '../database/mssql.database';

export interface UserProfile {
	user_id: string;
	bio: string | null;
	interests: string | null;
	skills: string | null;
	created_at: Date;
	updated_at: Date;
}

export const getUserProfile = async (user_id: string) => {
	const pool = await getDbConnection();

	const result = await pool.request().input('user_id', user_id).query(`
		SELECT user_id, bio, interests, skills, created_at, updated_at
		FROM [dbo].[user_profile]
		WHERE user_id = @user_id
	`);

	return result.recordset.length > 0 ? result.recordset[0] : null;
};

export const createUserProfile = async (
	user_id: string,
	bio: string | null,
	interests: string | null,
	skills: string | null
) => {
	const pool = await getDbConnection();

	const result = await pool
		.request()
		.input('user_id', user_id)
		.input('bio', bio)
		.input('interests', interests)
		.input('skills', skills).query(`
			INSERT INTO [dbo].[user_profile] (user_id, bio, interests, skills)
			OUTPUT inserted.user_id, inserted.bio, inserted.interests, inserted.skills, 
				   inserted.created_at, inserted.updated_at
			VALUES (@user_id, @bio, @interests, @skills)
		`);

	return result.recordset[0];
};

export const updateUserProfile = async (
	user_id: string,
	bio: string | null,
	interests: string | null,
	skills: string | null
) => {
	const pool = await getDbConnection();

	const result = await pool
		.request()
		.input('user_id', user_id)
		.input('bio', bio)
		.input('interests', interests)
		.input('skills', skills).query(`
			UPDATE [dbo].[user_profile]
			SET bio = @bio, 
				interests = @interests, 
				skills = @skills,
				updated_at = CURRENT_TIMESTAMP
			OUTPUT inserted.user_id, inserted.bio, inserted.interests, inserted.skills, 
				   inserted.created_at, inserted.updated_at
			WHERE user_id = @user_id
		`);

	return result.recordset.length > 0 ? result.recordset[0] : null;
};

export const upsertUserProfile = async (
	user_id: string,
	bio: string | null,
	interests: string | null,
	skills: string | null
) => {
	const existing = await getUserProfile(user_id);

	if (existing) {
		return await updateUserProfile(user_id, bio, interests, skills);
	} else {
		return await createUserProfile(user_id, bio, interests, skills);
	}
};
