import { connection } from "next/server";
import { getBlogPosts } from "@/lib/blogs";

export async function GET() {
  await connection();

  try {
    const posts = await getBlogPosts();

    return Response.json(posts);
  } catch (error) {
    console.error("GET /api/blogs failed:", error);

    return Response.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}