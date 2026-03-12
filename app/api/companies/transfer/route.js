import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { ulid } from "ulid";

export async function POST(req) {
  const client = await pool.connect();

  try {
    const { companyId, newUserId, adminId } = await req.json();

    if (!companyId || !newUserId) {
      return NextResponse.json(
        { message: "Company ID and New User ID are required" },
        { status: 400 },
      );
    }

    await client.query("BEGIN");

    // 1. Get current assignment details for history
    const companyResult = await client.query(
      `SELECT c.name, c.assigned_user_id, u.first_name, u.last_name 
       FROM companies c 
       LEFT JOIN users u ON c.assigned_user_id = u.id 
       WHERE c.id = $1`,
      [companyId],
    );

    if (companyResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 },
      );
    }

    const company = companyResult.rows[0];
    const oldUserId = company.assigned_user_id;
    const oldOwnerName = oldUserId
      ? `${company.first_name} ${company.last_name}`
      : "None";

    // Get new user details
    const newUserResult = await client.query(
      "SELECT first_name, last_name FROM users WHERE id = $1",
      [newUserId],
    );

    if (newUserResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "New user not found" },
        { status: 404 },
      );
    }

    const newUser = newUserResult.rows[0];
    const newOwnerName = `${newUser.first_name} ${newUser.last_name}`;

    // Get admin details (transferred by)
    let adminName = "Admin";
    if (adminId) {
      const adminResult = await client.query(
        "SELECT first_name, last_name FROM users WHERE id = $1",
        [adminId],
      );
      if (adminResult.rows.length > 0) {
        adminName = `${adminResult.rows[0].first_name} ${adminResult.rows[0].last_name}`;
      }
    }

    // 2. Deactivate previous assignment (optional if we just update, but following user's logic)
    // Actually, updating assigned_user_id effectively transfers it.
    // The user said: "Deactivate the previous assignment"
    // In their schema, "deactivate" means setting assigned_user_id to NULL and status to Inactive.

    // We'll perform the transfer in one go:
    await client.query(
      `UPDATE companies 
       SET assigned_user_id = $1, 
           status = 'Active', 
           deactivated_at = NULL, 
           deactivated_by = NULL 
       WHERE id = $2`,
      [newUserId, companyId],
    );

    // 3. Record the transfer in assignment history
    // We assume the table 'assignment_history' will be created by the user.

    const historyId = ulid();

    await client.query(
      `INSERT INTO company_assignment_history (
    id,
    company_id, 
    old_user_id, 
    new_user_id, 
    transferred_by_id, 
    company_name,
    old_owner_name,
    new_owner_name,
    transferred_by_name,
    transferred_at
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        historyId,
        companyId,
        oldUserId,
        newUserId,
        adminId || null,
        company.name,
        oldOwnerName,
        newOwnerName,
        adminName,
        new Date(),
      ],
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: `Company ${company.name} transferred to ${newOwnerName} successfully.`,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Transfer error:", error);
    return NextResponse.json(
      { message: "Transfer failed", error: error.message },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
