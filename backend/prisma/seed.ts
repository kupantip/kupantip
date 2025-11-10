import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import bcrypt from 'bcrypt';

async function main() {
	const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@1234';
	const hasdPassword = await bcrypt.hash(adminPassword, 10);

	const adminEmail = process.env.ADMIN_EMAIL || 'admin@admin.com';

	const adminHandleName = process.env.ADMIN_HANDLE || 'Admin';

	const admin = await prisma.app_user.create({
		data: {
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
