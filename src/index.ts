import { createClient } from "@supabase/supabase-js";
import serverlessExpress from "@codegenie/serverless-express";
import express from "express";

const app = express();

const supabase = createClient(
  process.env.SUPABASE_PROJECT_URL || "",
  process.env.SUPABASE_PUBLIC_ANON_KEY || ""
);

app.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Product")
      .select("title")
      .limit(1);

    if (error) throw error;

    console.log("Database queried successfully");
    res.json(data);
  } catch (error) {
    console.error("Error querying database:", error);
    res.status(500).json({ error });
  }
});

const serverlessHandler = serverlessExpress({ app });

export const handler = async (event: any, context: any) => {
  return serverlessHandler(event, context);
};
