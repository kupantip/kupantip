'use client';

import Link from "next/link";

export default function Page() {
	return (
		<div className="max-w-2xl mx-auto py-6 px-4 md:py-10 md:px-10">
			<h1 className="text-3xl font-bold mb-4 text-emerald-700">
				Help & Support
			</h1>
			<p className="mb-8 text-gray-600">
				Find answers to common questions or contact us for further
				assistance.
			</p>

			<section className="mb-8">
				<h2 className="text-xl font-semibold mb-2">
					Frequently Asked Questions
				</h2>
				<ul className="space-y-4">
					<li>
						<strong>How do I reset my password?</strong>
						<p className="text-gray-500">
							Go to your login page and click on &quot;Forget
							Password&quot;. Follow the instructions to reset
							your password.
						</p>
					</li>
					{/* <li>
						<strong>How can I contact support?</strong>
						<p className="text-gray-500">
							You can email us at{' '}
							<a
								href="mailto:support@kupantip.com"
								className="text-emerald-700 underline"
							>
								support@kupantip.com
							</a>
							.
						</p>
					</li> */}
				</ul>
			</section>

			<section className="mb-8">
				<h2 className="text-xl font-semibold mb-2">Contact Us</h2>
				<p className="text-gray-500 mb-2">
					If you need further help, please reach out:
				</p>
				<ul className="list-disc list-inside text-gray-600">
					<li>
						Email:{' '}
						<a
							href="mailto:support@kupantip.com"
							className="text-emerald-700 underline"
						>
							support@kupantip.com
						</a>
					</li>
					<li>
						Facebook:{' '}
						<a
							href="https://facebook.com/kupantip"
							className="text-emerald-700 underline"
							target="_blank"
							rel="noopener noreferrer"
						>
							facebook.com/kupantip
						</a>
					</li>
				</ul>
			</section>

			<section>
				<h2 className="text-xl font-semibold mb-2">Quick Links</h2>
				<ul className="list-disc list-inside text-gray-600">
					<li>
						<a
							href="https://github.com/kupantip"
							className="text-emerald-700 underline"
							target="_blank"
							rel="noopener noreferrer"
						>
							Github
						</a>
					</li>

					<li>
						<Link href="/" className="text-emerald-700 underline">
							Home
						</Link>
					</li>
				</ul>
			</section>
		</div>
	);
}
