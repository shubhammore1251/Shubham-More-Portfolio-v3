import { NextResponse } from "next/server";
import { connection } from "next/server";
import { getProjects } from "@/lib/projects";

const PROJECTS_LIMIT = 10;

export async function GET() {
  await connection();

  try {
    const projects = await getProjects({
      limit: PROJECTS_LIMIT,
      strict: true,
    });

    return NextResponse.json(
      {
        projects,
        count: projects.length,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("GET /api/projects failed:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch published projects.",
        ...(process.env.NODE_ENV === "development" && {
          details:
            error instanceof Error
              ? error.message
              : "Unknown error",
        }),
      },
      { status: 500 },
    );
  }
}