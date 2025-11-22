import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import bcrypt from 'bcrypt';

async function main() {
	const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@1234';
	const hasdPassword = await bcrypt.hash(adminPassword, 10);

	const adminEmail = process.env.ADMIN_EMAIL || 'admin@admin.com';

	const adminHandleName = process.env.ADMIN_HANDLE || 'Admin';

	const admin = await prisma.app_user.upsert({
		where: { email: adminEmail },
		update: {},
		create: {
			email: adminEmail,
			handle: adminHandleName,
			display_name: 'Administrator',
			user_secret: {
				create: {
					password_hash: hasdPassword,
				},
			},
			user_role: {
				create: {
					role: 'admin',
				},
			},
		},
		include: {
			user_secret: true,
			user_role: true,
		},
	});

	console.log('Admin user created:', admin);

	const categories = ['Community', 'Recruit', 'General', 'Events'];

	for (const categoryName of categories) {
		const category = await prisma.category.findFirst({
			where: { label: categoryName },
		});
		if (!category) {
			const newCategory = await prisma.category.create({
				data: { label: categoryName },
			});
			console.log('Category ensured:', newCategory);
		} else {
			console.log('Category ensured:', category);
		}
	}
}
main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
