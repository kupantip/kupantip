'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function LoginPage() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const identifier = formData.get('identifier') as string
        const password = formData.get('password') as string

        const res = await signIn('credentials', {
            redirect: false,
            identifier,
            password,
        })

        setLoading(false)

        if (res?.error) {
            setError('Invalid username or password')
        } else {
            router.push('/')
        }
    }

    return (
        <div className="relative flex items-center justify-center min-h-screen">
            {/* Background image */}
            <div className="absolute inset-0 bg-[url('/login/loginbg.jpg')] bg-[length:120%] bg-center"></div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gray-900/40"></div>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="relative z-10 p-6 bg-white shadow-md rounded-lg w-96"
            >
                <div className="text-[var(--color-green-primary)] text-2xl text-center font-semibold mb-2">
                    KU PANTIP
                </div>
                <div className="text-3xl text-center font-semibold mb-8">
                    Welcome Back
                </div>
                {error && <p className="text-red-500 mb-2">{error}</p>}
                <hr className="border-t border-gray-300 mb-6" />
                <h3 className="text-sm font-medium mb-1">Username</h3>
                <Input
                    type="text"
                    name="identifier"
                    placeholder="Username"
                    className="w-full p-2 py-5 border rounded mb-2"
                />
                <h6 className="text-sm font-medium mt-4 mb-1">Password</h6>
                <Input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-full p-2 py-5 border rounded mb-4"
                    required
                />
                <div className="flex flex-col gap-2 text-sm mt-4 mb-5">
                    <Link
                        href="/forgot-password"
                        className="text-blue-600 hover:underline"
                        onClick={(e) => {
                            e.preventDefault() // stops page reload
                            setLoading(true)
                            router.push('/forgot-password')
                        }}
                    >
                        Forgot Password?
                    </Link>
                    <Link
                        href="/signup"
                        className="text-blue-600 hover:underline"
                        onClick={(e) => {
                            e.preventDefault()
                            setLoading(true)
                            router.push('/signup')
                        }}
                    >
                        New to KU Pantip? Sign Up
                    </Link>
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-green-600 hover:bg-green-500 text-white p-2 rounded flex items-center justify-center ${
                        loading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                >
                    {loading ? 'Signing In...' : 'Sign In'}
                </Button>
            </form>

            {/* Fullscreen Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
                    <div className="flex flex-col items-center">
                        <svg
                            className="animate-spin h-10 w-10 text-white mb-3"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                            ></path>
                        </svg>
                        <p className="text-white text-lg font-medium">
                            Please wait...
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
