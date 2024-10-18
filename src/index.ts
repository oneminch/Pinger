import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables when running locally
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

interface Env {
  SUPABASE_PROJECT_URL: string;
  SUPABASE_PUBLIC_ANON_KEY: string;
}

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ) {
    const supabase = createClient(
      env.SUPABASE_PROJECT_URL,
      env.SUPABASE_PUBLIC_ANON_KEY
    );

    try {
      const { error } = await supabase.from("Product").select("title").limit(1);

      if (error) throw error;
      console.log("Database queried successfully");
    } catch (error) {
      console.error("Error querying database:", error);
    }
  }
};
