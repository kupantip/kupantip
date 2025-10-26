import { useState, useEffect } from 'react';

const BACKEND_HOST = process.env.NEXT_PUBLIC_BACKEND_HOST;

interface votePostData{
  postId: string
  value: number
}

export async function votePost(data: votePostData) {
    const res = await fetch(`${BACKEND_HOST}/post-vote/${data.postId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ value: data.value }),
    });

    if (!res.ok) {
      throw new Error(`Failed to upvote/downvote: ${res.status}`);
    }

	return res.json();
}

export async function deletevotePost(postId: string) {
    const res = await fetch(`${BACKEND_HOST}/post-vote/${postId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(`Failed to deletevote: ${res.status}`);
    }

    return res.json();
}

interface voteCommentData{
  commentId: string
  value: number
}

export async function voteComment(data: voteCommentData) {
    const res = await fetch(`${BACKEND_HOST}/comment-vote/${data.commentId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ value: data.value }),
    });

    if (!res.ok) {
      throw new Error(`Failed to upvote/downvote: ${res.status}`);
    }

	return res.json();
}

export async function deletevoteComment(commentId: string) {
    const res = await fetch(`${BACKEND_HOST}/comment-vote/${commentId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

	if (!res.ok) {
		throw new Error(`Failed to deletevote: ${res.status}`);
	}

	return res.json();
}

export function useUserVote(postId: string, currentuser_id: string) {
	const userID = currentuser_id;
	const [userVote, setUserVote] = useState<number>(0);

	useEffect(() => {
		const storedVotes = JSON.parse(
			localStorage.getItem(`userVotes_${userID}`) || '{}'
		);
		setUserVote(storedVotes[postId] || 0);
	}, [postId, userID]);

	const updateUserVote = (newVote: number) => {
		const storedVotes = JSON.parse(
			localStorage.getItem(`userVotes_${userID}`) || '{}'
		);
		const updatedVotes = { ...storedVotes, [postId]: newVote };
		localStorage.setItem(
			`userVotes_${userID}`,
			JSON.stringify(updatedVotes)
		);
		setUserVote(newVote);
	};

	return { userVote, updateUserVote };
}
