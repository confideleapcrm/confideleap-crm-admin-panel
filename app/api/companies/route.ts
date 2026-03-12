import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { ulid } from "ulid";

export async function POST(req: Request) {
  const client = await pool.connect();

  try {
    const body = await req.json();
    const { company, employees, services, assigned_user_id } = body;

    await client.query("BEGIN");

    /* ================= INSERT COMPANY ================= */

    const companyId = ulid();

    await client.query(
      `
      INSERT INTO companies
      (
        id,
        name,
        company_register_address,
        website,
        gst_number,
        pan_number,
        contact_number,
        linkedin,
        social_media,
        domain,
        industry,
        status,
        assigned_user_id
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      `,
      [
        companyId,
        company.name,
        company.company_register_address,
        company.website,
        company.gst_number,
        company.pan_number,
        company.contact_number,
        company.linkedin,
        company.social_media,
        company.domain,
        company.industry,
        company.status || "Inactive",
        assigned_user_id || null,
      ],
    );

    /* ================= INSERT COMPANY USERS ================= */

    if (assigned_user_id) {
      await client.query(
        `
        INSERT INTO company_users
        (
          company_id,
          user_id,
          role
        )
        VALUES ($1,$2,$3)
        `,
        [companyId, assigned_user_id, "owner"],
      );
    }

    /* ================= INSERT COMPANY EMPLOYEES ================= */

    if (employees && employees.length > 0) {
      for (let i = 0; i < employees.length; i++) {
        const emp = employees[i];
        const employeeId = ulid();

        await client.query(
          `
          INSERT INTO company_employees
          (
            id,
            company_id,
            first_name,
            last_name,
            email,
            designation,
            phone,
            linkedin_url,
            is_primary
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
          `,
          [
            employeeId,
            companyId,
            emp.firstName,
            emp.lastName || null,
            emp.email || null,
            emp.designation || null,
            emp.phone || null,
            emp.linkedin || null,
            i === 0, // first employee primary
          ],
        );
      }
    }

    /* ================= INSERT CUSTOMER SERVICES ================= */

    for (const key in services) {
      const service = services[key];

      if (service.selected) {
        const serviceId = ulid();

        await client.query(
          `
          INSERT INTO customer_services
          (
            id,
            company_id,
            service_key,
            service_label,
            price
          )
          VALUES ($1,$2,$3,$4,$5)
          `,
          [
            serviceId,
            companyId,
            key,
            key.replace(/_/g, " "), // label
            Number(service.price || 0),
          ],
        );
      }
    }

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "Company created successfully",
      company_id: companyId,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Create company error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create company",
      },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
