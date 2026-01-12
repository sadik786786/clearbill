import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/app/lib/db";

/**
 * GET – Fetch single client
 */
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const result = await pool.query(
      `
      SELECT *
      FROM clients
      WHERE id = $1 AND user_id = $2
      `,
      [id, session.user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500 }
    );
  }
}

/**
 * PUT – Update client
 */
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { name, email, phone, company, address } = await req.json();

  try {
    const result = await pool.query(
      `
      UPDATE clients
      SET name = $1, email = $2, phone = $3, company = $4, address = $5
      WHERE id = $6 AND user_id = $7
      RETURNING *
      `,
      [name, email, phone, company, address, id, session.user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}

/**
 * DELETE – Delete client
 */
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await pool.query(
      `
      DELETE FROM clients
      WHERE id = $1 AND user_id = $2
      `,
      [id, session.user.id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
}
