import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

export async function GET(req) {
  try {
    // Get query params from URL
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10); // default page 1
    const limit = parseInt(searchParams.get("limit") || "10", 10); // default 10 items per page
    const offset = (page - 1) * limit;

    // Optional: search query
    const search = searchParams.get("search")?.toLowerCase() || "";

    // Base query
    let query = `
      SELECT id, email, first_name, last_name, role
      FROM public.users
    `;
    const values = [];

    // If search exists, add WHERE
    if (search) {
      query += `
        WHERE LOWER(first_name || ' ' || last_name) LIKE $1
           OR LOWER(email) LIKE $1
           OR LOWER(role) LIKE $1
      `;
      values.push(`%${search}%`);
    }

    // Add pagination
    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    // Execute query
    const result = await pool.query(query, values);

    // Optional: get total count for frontend pagination
    const countResult = await pool.query(
      search
        ? `
      SELECT COUNT(*) as total
      FROM public.users
      WHERE LOWER(first_name || ' ' || last_name) LIKE $1
         OR LOWER(email) LIKE $1
         OR LOWER(role) LIKE $1
      `
        : `SELECT COUNT(*) as total FROM public.users`,
      search ? [`%${search}%`] : [],
    );

    const total = parseInt(countResult.rows[0].total, 10);

    return NextResponse.json({
      success: true,
      users: result.rows,
      page,
      limit,
      total,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
      },
      { status: 500 },
    );
  }
}
