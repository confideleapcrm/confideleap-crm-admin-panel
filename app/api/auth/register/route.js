import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      jobTitle,
      department,
      role,
      allowed_routes,
    } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password required" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert user
    const { rows } = await pool.query(
      `
      INSERT INTO users (
        email,
        password_hash,
        first_name,
        last_name,
        job_title,
        department,
        role
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING id, email, role
      `,
      [
        email,
        hashedPassword,
        first_name,
        last_name,
        jobTitle,
        department,
        role || "user",
        allowed_routes,
      ],
    );

    return NextResponse.json({
      success: true,
      user: rows[0],
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { message: "Registration failed" },
      { status: 500 },
    );
  }
}
