// app/protected/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="p-6">
      <h1 className="text-2xl">Protected Page</h1>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
