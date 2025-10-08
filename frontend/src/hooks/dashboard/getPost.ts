import * as t from '@/types/dashboard/post';

const BACKEND_HOST = process.env.NEXT_PUBLIC_BACKEND_HOST;

const postFilterMap: Record<string, string> = {
    Announcement: '9108433E-F36B-1410-84CA-00F2EA0D0522',
    Community: '9708433E-F36B-1410-84CA-00F2EA0D0522',
    Recruitment: '9D08433E-F36B-1410-84CA-00F2EA0D0522'
};

export async function getPost(filterName: string): Promise<t.Post[]> {
	try {
        const categoryId = postFilterMap[filterName];
        const res = await fetch(`${BACKEND_HOST}/post?category_id=${categoryId}`);

		if (!res.ok) {
			throw new Error(
				`Failed to fetch data: ${res.status} ${res.statusText}`
			);
		}

		const json: t.Post[] = await res.json();
		return json;
	} catch (err: unknown) {
		if (err instanceof Error) {
			throw new Error(err.message);
		} else {
			throw new Error(String(err));
		}
	}
}
