import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/app/lib/db";

/**
 * GET – Fetch all clients for logged-in user
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await pool.query(
      `
      SELECT *
      FROM clients
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [session.user.id]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

/**
 * POST – Create new client
 */
export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email, phone, company, address } = await req.json();

  if (!name || !email) {
    return NextResponse.json(
      { error: "Name and email are required" },
      { status: 400 }
    );
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO clients (user_id, name, email, phone, company, address)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [session.user.id, name, email, phone, company, address]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}
