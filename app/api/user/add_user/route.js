import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { ulid } from "ulid";
import { NextResponse } from "next/server";

export async function POST(req) {
  const client = await pool.connect();

  try {
    const {
      email,
      password,
      first_name,
      last_name,
      job_title,
      department,
      role,
      allowed_routes,
      assigned_companies = [], // These are IDs from the multi-select
    } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password required" },
        { status: 400 },
      );
    }

    await client.query("BEGIN");

    // 1. Check if user exists
    const existing = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );

    if (existing.rows.length > 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const userId = ulid(); // 26-character ULID

    // 2. Insert user (without assigned_companies as a column)
    const { rows: userRows } = await client.query(
      `
  INSERT INTO users (
    id,
    email,
    password_hash,
    first_name,
    last_name,
    job_title,
    department,
    role,
    allowed_routes
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  RETURNING id, email, role
  `,
      [
        userId,
        email,
        hashedPassword,
        first_name,
        last_name,
        job_title,
        department,
        role || "user",
        allowed_routes,
      ],
    );

    // 3. Link companies and log in history
    if (assigned_companies.length > 0) {
      // Fetch names for history logging
      const companyNamesRes = await client.query(
        "SELECT id, name FROM companies WHERE id = ANY($1::varchar[])",
        [assigned_companies],
      );

      const companyMap = {};
      companyNamesRes.rows.forEach((r) => (companyMap[r.id] = r.name));

      await client.query(
        `
    UPDATE companies
    SET 
      assigned_user_id = $1,
      status = 'Active',
      deactivated_at = NULL,
      deactivated_by = NULL
    WHERE id = ANY($2::varchar[])
    `,
        [userId, assigned_companies],
      );

      // Log to history
      const newOwnerName = `${first_name} ${last_name}`;
      for (const compId of assigned_companies) {
        const historyId = ulid(); // 🔥 generate id

        await client.query(
          `INSERT INTO company_assignment_history (
           id,
           company_id,
           old_user_id,
           new_user_id,
           company_name,
           old_owner_name,
           new_owner_name,
           transferred_by_name,
           transferred_at
    )
    VALUES ($1,$2,NULL,$3,$4,'None',$5,'System/Onboarding',NOW())`,
          [
            historyId,
            compId,
            userId,
            companyMap[compId] || "Unknown",
            newOwnerName,
          ],
        );
      }
    }

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      user: userRows[0],
    });
  } catch (error) {
    if (client) await client.query("ROLLBACK");
    console.error("Add User error:", error);

    return NextResponse.json(
      { message: "Registration failed", error: error.message },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
