import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function DELETE(req, { params }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Delete related records first (if they don't have CASCADE)
    // Based on the POST route, we have:
    // 1. company_employees
    // 2. customer_services
    // 3. company_users
    // 4. company_assignment_history
    
    await client.query("DELETE FROM company_employees WHERE company_id = $1", [id]);
    await client.query("DELETE FROM customer_services WHERE company_id = $1", [id]);
    await client.query("DELETE FROM company_users WHERE company_id = $1", [id]);
    await client.query("DELETE FROM company_assignment_history WHERE company_id = $1", [id]);

    // Finally delete the company
    const result = await client.query("DELETE FROM companies WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    await client.query("COMMIT");

    return NextResponse.json({ message: "Company deleted successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Delete company error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
