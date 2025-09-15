import { ParsedQs } from 'qs';

export type CommentReq = {
	post_id: string | ParsedQs | (string | ParsedQs)[] | undefined;
	author_id: string;
	parent_id?: string;
	body_md: string;
};
