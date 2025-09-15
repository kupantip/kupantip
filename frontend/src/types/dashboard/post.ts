export interface Attachment {
  id: string;
  url: string;
  mime_type: string;
}

export interface Post {
  id: string;
  title: string;
  body_md: string | null;
  url: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  author_name: string;
  author_id: string;
  category_label: string | null;
  category_id: string | null;
  attachments: Attachment[];
}


// {
//     "id": "A505433E-F36B-1410-84CA-00F2EA0D0522",
//     "title": "ผมรัก gpt",
//     "body_md": null,
//     "url": "http://example.com",
//     "created_at": "2025-09-10T09:00:05.840Z",
//     "updated_at": "2025-09-10T09:00:05.840Z",
//     "author_name": "paranyuGPT",
//     "author_id": "A005433E-F36B-1410-84CA-00F2EA0D0522",
//     "category_label": null,
//     "category_id": null,
//     "attachments": [
//         {
//             "id": "A605433E-F36B-1410-84CA-00F2EA0D0522",
//             "url": "/uploads/1757494782163-480090381.png",
//             "mime_type": "png"
//         }
//     ]
// }