import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.industry,
        c.domain,
        c.status AS company_status,
        c.assigned_user_id,

        u.first_name,
        u.last_name

      FROM companies c

      LEFT JOIN users u
      ON c.assigned_user_id = u.id

      ORDER BY c.created_at DESC
    `);

    return NextResponse.json({ companies: result.rows });
  } catch (error) {
    console.error("DB error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
