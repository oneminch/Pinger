import { createClient } from "@supabase/supabase-js";

interface SupabaseConfig {
  projectUrl: string;
  publicAnonKey: string;
}

type SupabaseClient = ReturnType<typeof createClient>;

let supabaseClient: SupabaseClient;

const getSupabaseClient = (config: SupabaseConfig) => {
  if (!config.projectUrl || !config.publicAnonKey) {
    throw new Error("Invalid Supabase configuration");
  }

  if (!supabaseClient) {
    supabaseClient = createClient(config.projectUrl, config.publicAnonKey);
  }

  return supabaseClient;
};

const querySupabase = async (supabase: SupabaseClient) => {
  try {
    const { data, error } = await supabase
      .from("Product")
      .select("title")
      .limit(1);

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export { getSupabaseClient, querySupabase, type SupabaseConfig };
