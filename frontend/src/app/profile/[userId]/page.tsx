'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	User,
	Mail,
	Calendar,
	FileText,
	MessageSquare,
	TrendingUp,
	Award,
	Edit,
	Loader2,
} from 'lucide-react';
import { usePostByUserId } from '@/services/post/post';
import { useUserStats } from '@/services/user/user';
import Link from 'next/link';

type UserPayload = {
	user_id: string;
	email: string;
	username: string;
	role: string;
};

const formatTime = (minutes: number) => {
	if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
	if (minutes < 1440)
		return `${Math.floor(minutes / 60)} hour${
			Math.floor(minutes / 60) !== 1 ? 's' : ''
		} ago`;
	return `${Math.floor(minutes / 1440)} day${
		Math.floor(minutes / 1440) !== 1 ? 's' : ''
	} ago`;
};

export default function MyProfilePage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const params = useParams();
	const userId = params.userId as string;

	const [copied, setCopied] = useState(false);

	const copyCurrentUrl = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000); // Reset 'copied' state after 2 seconds
		} catch (err) {
			console.error('Failed to copy URL: ', err);
		}
	};

	useEffect(() => {
		AOS.init({
			duration: 500,
			once: true,
			offset: 80,
		});
	}, []);

	useEffect(() => {
		if (status === 'unauthenticated') {
			router.push('/login');
		}
	}, [status, router]);

	const { data: userStats, isLoading: isLoadingStats } = useUserStats(userId);
	const { data: post, isLoading: isLoadingPost } = usePostByUserId(userId);
	const firstThreePost = post?.slice(0, 3) || [];

	if (status === 'unauthenticated') {
		return null; // Will redirect in useEffect
	}

	// if (isLoadingStats) {
	// 	return (
	// 		<div className="flex items-center justify-center h-screen">
	// 			<Loader2 className="animate-spin w-12 h-12 text-green-1" />
	// 		</div>
	// 	);
	// }

	const badges = [
		{
			name: 'Top Contributor',
			icon: '🏆',
			color: 'bg-yellow-100 text-yellow-800',
		},
		{ name: 'Helpful', icon: '🤝', color: 'bg-blue-100 text-blue-800' },
		{
			name: 'Early Adopter',
			icon: '⭐',
			color: 'bg-purple-100 text-purple-800',
		},
	];

	return (
		<div
			data-aos="fade-up"
			className="min-h-screen px-10 py-8 space-y-6 rounded-lg bg-gray-50 dark:bg-gray-900"
		>
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<Link
							href="/posts"
							className="bg-green-3 text-black py-1 px-2 rounded-lg hover:scale-102 hover:bg-emerald-600 hover:text-white border-1"
						>
							Home
						</Link>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>My Profile</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			{/* Profile Header Card */}
			<Card className="shadow-md">
				<CardContent className="pt-1">
					<div className="flex flex-col md:flex-row items-start md:items-center gap-6">
						<Avatar className="w-24 h-24 border-emerald-600 border-3">
							<AvatarImage
								src={`https://api.dicebear.com/7.x/initials/svg?seed=${userStats?.display_name}`}
							/>
							<AvatarFallback className="text-2xl">
								{userStats?.display_name
									?.charAt(0)
									.toUpperCase() || 'U'}
							</AvatarFallback>
						</Avatar>

						<div className="flex-1 space-y-2">
							<div className="flex items-center gap-3">
								<h1 className="text-3xl font-bold">
									{userStats?.display_name ||
										'Anonymous User'}
								</h1>
								<Badge
									variant="outline"
									className="bg-green-100 text-green-800"
								>
									{userStats?.role || 'User'}
								</Badge>
							</div>
							<div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
								<div className="flex items-center gap-2">
									<User className="w-4 h-4" />
									<span>@{userStats?.handle || 'user'}</span>
								</div>
								<div className="flex items-center gap-2">
									<Mail className="w-4 h-4" />
									<span>
										{userStats?.email ||
											'email@example.com'}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<Calendar className="w-4 h-4" />
									<span>
										Joined{' '}
										{userStats?.created_at
											? new Date(
													userStats.created_at
											  ).toLocaleDateString('en-US', {
													year: 'numeric',
													month: 'long',
											  })
											: 'Recently'}
									</span>
								</div>
							</div>{' '}
							<div className="flex gap-2 pt-2">
								{session?.user.id === userId && (
									<Button className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer">
										<Edit className="w-4 h-4 mr-2" />
										Edit Profile
									</Button>
								)}

								<Button
									variant="outline"
									className="cursor-pointer"
									onClick={copyCurrentUrl}
									disabled={copied}
								>
									{copied ? 'Copied!' : 'Share Profile'}
								</Button>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Stats Grid */}
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
				<Card>
					<CardContent className="pt-6 text-center">
						<FileText className="w-8 h-8 mx-auto mb-2 text-green-1" />
						<div className="text-2xl font-bold">
							{userStats?.posts_count || 0}
						</div>
						<div className="text-sm text-gray-600">Posts</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6 text-center">
						<MessageSquare className="w-8 h-8 mx-auto mb-2 text-blue-600" />
						<div className="text-2xl font-bold">
							{userStats?.comments_count || 0}
						</div>
						<div className="text-sm text-gray-600">Comments</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6 text-center">
						<TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
						<div className="text-2xl font-bold">
							{userStats?.upvotes_given || 0}
						</div>
						<div className="text-sm text-gray-600">
							Upvotes Given
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6 text-center">
						<TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-600" />
						<div className="text-2xl font-bold">
							{userStats?.downvotes_given || 0}
						</div>
						<div className="text-sm text-gray-600">
							Downvotes Given
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6 text-center">
						<Award className="w-8 h-8 mx-auto mb-2 text-purple-600" />
						<div className="text-2xl font-bold">
							{userStats?.upvotes_received || 0}
						</div>
						<div className="text-sm text-gray-600">
							Upvotes Received
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6 text-center">
						<Award className="w-8 h-8 mx-auto mb-2 text-red-600" />
						<div className="text-2xl font-bold">
							{userStats?.downvotes_received || 0}
						</div>
						<div className="text-sm text-gray-600">
							Downvotes Received
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Tabs Section */}
			<Tabs defaultValue="activity" className="w-full">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="activity">Recent Activity</TabsTrigger>
					{/* <TabsTrigger value="badges">Badges</TabsTrigger> */}
					<TabsTrigger value="about">About</TabsTrigger>
				</TabsList>

				{/* Recent Activity Tab */}
				<TabsContent value="activity" id="post">
					<Card>
						<CardHeader>
							<CardTitle>Recent Activity</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 ">
							{isLoadingPost ? (
								// Loading state
								<div className="flex items-center justify-center py-8">
									<div className="text-center">
										<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-1 mx-auto"></div>
										<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
											Loading posts...
										</p>
									</div>
								</div>
							) : post && post.length > 0 ? (
								// Show first 3 posts
								firstThreePost.map((activity) => (
									<Link
										key={activity.id}
										href={`/posts/${activity.id}`}
										className="block"
									>
										<div className="flex items-start gap-4 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition hover:scale-102 cursor-pointer">
											<div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
												<FileText className="w-4 h-4 text-green-600" />
											</div>
											<div className="flex-1">
												<p className="font-medium">
													{activity.title}
												</p>
												<p className="text-sm text-gray-500">
													{formatTime(
														activity.minutes_since_posted
													)}
												</p>
											</div>
										</div>
									</Link>
								))
							) : (
								// No posts found
								<div className="text-center py-8">
									<p className="text-gray-500 text-sm italic">
										No posts yet.
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Badges Tab */}
				<TabsContent value="badges">
					<Card>
						<CardHeader>
							<CardTitle>Achievements & Badges</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{badges.map((badge, index) => (
									<div
										key={index}
										className="flex items-center gap-3 p-4 border rounded-lg hover:shadow-md transition"
									>
										<div className="text-3xl">
											{badge.icon}
										</div>
										<div>
											<Badge className={badge.color}>
												{badge.name}
											</Badge>
											<p className="text-xs text-gray-500 mt-1">
												Earned for outstanding
												contributions
											</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* About Tab */}
				<TabsContent value="about">
					<Card>
						<CardHeader>
							<CardTitle>About Me</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<h3 className="font-semibold mb-2">Bio</h3>
								<p className="text-gray-600 dark:text-gray-400">
									Student at XYZ University, passionate about
									technology and learning. Active member of
									the community, always ready to help fellow
									students.
								</p>
							</div>
							<Separator />
							<div>
								<h3 className="font-semibold mb-2">
									Interests
								</h3>
								<div className="flex flex-wrap gap-2">
									<Badge variant="secondary">
										Programming
									</Badge>
									<Badge variant="secondary">
										Web Development
									</Badge>
									<Badge variant="secondary">
										Data Science
									</Badge>
									<Badge variant="secondary">
										UI/UX Design
									</Badge>
								</div>
							</div>
							<Separator />
							<div>
								<h3 className="font-semibold mb-2">Skills</h3>
								<div className="flex flex-wrap gap-2">
									<Badge className="bg-blue-100 text-blue-800">
										TypeScript
									</Badge>
									<Badge className="bg-green-100 text-green-800">
										React
									</Badge>
									<Badge className="bg-purple-100 text-purple-800">
										Next.js
									</Badge>
									<Badge className="bg-orange-100 text-orange-800">
										Python
									</Badge>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
