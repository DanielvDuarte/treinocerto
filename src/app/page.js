import { createClient } from "@/lib/supabase/server";
import Login from "@/components/Login";
import Dashboard from "@/components/Dashboard";

export default async function Page() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <Login />;

  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    "atleta";

  return <Dashboard userName={name} />;
}
