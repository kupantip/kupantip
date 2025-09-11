export type CommentReq = {
	post_id: string;
	author_id: string;
	parent_id?: string;
	body_md: string;
};
