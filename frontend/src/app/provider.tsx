"use client"

import { SessionProvider } from "next-auth/react"

export const CustomProviders = ({
    children
}: {
    children: React.ReactNode
}) => {
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    )
}