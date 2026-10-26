import { UserButton } from "@clerk/nextjs";
import { checkUser } from "@/actions/check-user";

// Halaman sementara Langkah 4: memastikan login dan sinkronisasi User ke database berjalan.
export default async function DashboardPage() {
  const user = await checkUser();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4">
      <UserButton />
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>User di database: {user ? user.email : "tidak ditemukan"}</p>
    </main>
  );
}