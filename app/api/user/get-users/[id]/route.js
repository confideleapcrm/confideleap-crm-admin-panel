import { NextResponse } from "next/server";
import pool from "../../../../../lib/db";
import bcrypt from "bcryptjs";

/**
 * ==============================
 * GET USER BY ID
 * ==============================
 */
export async function GET(req, { params }) {
  const userId = params?.id;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const userResult = await pool.query(
      `
      SELECT
        id,
        email,
        first_name,
        last_name,
        role,
        job_title,
        department,
        allowed_routes,
        created_at
      FROM users
      WHERE id = $1
      `,
      [userId],
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User Not Found" }, { status: 404 });
    }

    const user = userResult.rows[0];

    /**
     * Fetch ACTIVE companies assigned to this user
     */
    const companiesResult = await pool.query(
      `
      SELECT id
      FROM companies
      WHERE assigned_user_id = $1
      AND status = 'Active'
      `,
      [userId],
    );

    user.assigned_companies = companiesResult.rows.map((row) => row.id);

    return NextResponse.json(user);
  } catch (error) {
    console.error("DB error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * ==============================
 * UPDATE USER
 * ==============================
 */
export async function PUT(req, { params }) {
  const userId = params.id;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const body = await req.json();

  const {
    email,
    first_name,
    last_name,
    role,
    job_title,
    department,
    password,
    allowed_routes,
    assigned_companies = [],
  } = body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let query;
    let queryParams;

    /**
     * ==============================
     * UPDATE USER DATA
     * ==============================
     */
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 12);

      query = `
        UPDATE users
        SET
          email = $1,
          first_name = $2,
          last_name = $3,
          role = $4,
          job_title = $5,
          department = $6,
          allowed_routes = $7,
          password_hash = $8
        WHERE id = $9
        RETURNING *
      `;

      queryParams = [
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
      query = `
        UPDATE users
        SET
          email = $1,
          first_name = $2,
          last_name = $3,
          role = $4,
          job_title = $5,
          department = $6,
          allowed_routes = $7
        WHERE id = $8
        RETURNING *
      `;

      queryParams = [
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

    const result = await client.query(query, queryParams);

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "User Not Found" }, { status: 404 });
    }

    /**
     * ==============================
     * COMPANY ASSIGNMENT LOGIC (With Logging)
     * ==============================
     */
    const activeCompanies = assigned_companies || [];
    const newOwnerName = `${first_name} ${last_name}`;

    // 1. Fetch current assignments to see what's changing
    const currentAssignmentsRes = await client.query(
      `SELECT c.id, c.name, u.first_name, u.last_name
       FROM companies c
       LEFT JOIN users u ON c.assigned_user_id = u.id
       WHERE c.assigned_user_id = $1`,
      [userId]
    );
    const oldAssignedIds = currentAssignmentsRes.rows.map(r => r.id);
    const companyInfoMap = {};
    currentAssignmentsRes.rows.forEach(r => {
      companyInfoMap[r.id] = { name: r.name, ownerName: `${r.first_name} ${r.last_name}` };
    });

    // 2. Identify removals (Deactivations)
    const toRemove = oldAssignedIds.filter(id => !activeCompanies.includes(id));
    if (toRemove.length > 0) {
      await client.query(
        `UPDATE companies
         SET status = 'Inactive', deactivated_at = NOW(), deactivated_by = $1
         WHERE id = ANY($2::uuid[])`,
        [userId, toRemove]
      );

      // Log removals
      for (const compId of toRemove) {
        await client.query(
          `INSERT INTO company_assignment_history (
            company_id, old_user_id, new_user_id, company_name, old_owner_name, new_owner_name, transferred_by_name, transferred_at
          ) VALUES ($1, $2, NULL, $3, $4, 'None', 'System/Update', NOW())`,
          [compId, userId, companyInfoMap[compId]?.name || "Unknown", newOwnerName]
        );
      }
    }

    // 3. Identify new assignments
    const toAdd = activeCompanies.filter(id => !oldAssignedIds.includes(id));
    if (toAdd.length > 0) {
      // Need names for new ones
      const newCompaniesRes = await client.query(
        `SELECT id, name FROM companies WHERE id = ANY($1::uuid[])`,
        [toAdd]
      );
      const newCompanyNames = {};
      newCompaniesRes.rows.forEach(r => newCompanyNames[r.id] = r.name);

      await client.query(
        `UPDATE companies
         SET assigned_user_id = $1, status = 'Active', deactivated_at = NULL, deactivated_by = NULL
         WHERE id = ANY($2::uuid[])`,
        [userId, toAdd]
      );

      // Log additions
      for (const compId of toAdd) {
        await client.query(
          `INSERT INTO company_assignment_history (
            company_id, old_user_id, new_user_id, company_name, old_owner_name, new_owner_name, transferred_by_name, transferred_at
          ) VALUES ($1, NULL, $2, $3, 'None', $4, 'System/Update', NOW())`,
          [compId, userId, newCompanyNames[compId] || "Unknown", newOwnerName]
        );
      }
    }

    await client.query("COMMIT");

    /**
     * Return updated user
     */
    const updatedUser = result.rows[0];
    updatedUser.assigned_companies = activeCompanies;

    return NextResponse.json(updatedUser);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("DB error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
