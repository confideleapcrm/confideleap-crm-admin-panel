import { NextResponse } from "next/server";
import pool from "../../../../../lib/db";
import bcrypt from "bcryptjs";

export async function GET(req, { params }) {
  const userId = params?.id;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const result = await pool.query(
      `
  SELECT
    id,
    email,
    first_name,
    last_name,
    role,
    job_title,
    department,
    role,
    allowed_routes,
    password_hash,
    created_at
  FROM users
  WHERE id = $1
  `,
      [userId],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User Not Found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("DB error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(req, { params }) {
  const userId = params.id;
  const body = await req.json();
  const {
    email,
    first_name,
    last_name,
    role,
    job_title,
    department,
    password, // Plain text from frontend
    allowed_routes,
  } = body;

  try {
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    let query;
    let params;

    if (password && password.trim() !== "") {
      // 1. If a password is provided, HASH IT
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      query = `
             UPDATE users
             SET email=$1, first_name=$2, last_name=$3, role=$4, job_title=$5, department=$6, allowed_routes=$7, password_hash=$8
             WHERE id=$9
             RETURNING *`;

      params = [
        email,
        first_name,
        last_name,
        role,
        job_title,
        department,
        allowed_routes,
        hashedPassword,
        userId,
      ];
    } else {
      // 2. If no password provided, update everything EXCEPT password_hash
      query = `
    UPDATE users
    SET email=$1, first_name=$2, last_name=$3, role=$4, job_title=$5, department=$6, allowed_routes=$7
    WHERE id=$8
    RETURNING *`;

      params = [
        email,
        first_name,
        last_name,
        role,
        job_title,
        department,
        allowed_routes,
        userId,
      ];
    }

    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User Not Found " }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("DB error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
