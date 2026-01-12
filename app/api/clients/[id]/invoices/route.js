import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/app/lib/db";

/**
 * GET – Fetch invoices for a specific client
 * URL: /api/clients/:id/invoices
 */
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user_id = session.user.id;
    const {id} = await params;
    const client_id = id;

    // Verify client belongs to user
    const clientCheck = await pool.query(
      `
      SELECT id
      FROM clients
      WHERE id = $1 AND user_id = $2
      `,
      [client_id, user_id]
    );

    if (clientCheck.rowCount === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Fetch invoices for this client
    const invoicesRes = await pool.query(
      `
      SELECT
        invoices.id,
        invoices.invoice_number,
        invoices.issue_date,
        invoices.due_date,
        invoices.subtotal,
        invoices.tax,
        invoices.discount,
        invoices.total,
        invoices.currency,
        invoices.status,
        invoices.created_at
      FROM invoices
      WHERE invoices.client_id = $1
        AND invoices.user_id = $2
      ORDER BY invoices.issue_date DESC
      `,
      [client_id, user_id]
    );

    // Convert numeric fields
    const invoices = invoicesRes.rows.map((inv) => ({
      ...inv,
      subtotal: Number(inv.subtotal),
      tax: Number(inv.tax),
      discount: Number(inv.discount),
      total: Number(inv.total),
    }));

    return NextResponse.json({ invoices });

  } catch (error) {
    console.error("Fetch client invoices error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
