import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/app/lib/db";

const ALLOWED_CURRENCIES = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
};

/* =========================
   CREATE INVOICE (POST)
========================= */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user_id = session.user.id;
    const body = await req.json();

    const {
      client_id,
      invoice_number,
      issue_date,
      due_date,
      status,
      items,
      tax = 0,
      discount = 0,
      notes = "",
      currency = "USD", // ✅ new
    } = body;

    if (!client_id || !invoice_number || !issue_date || !due_date || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!ALLOWED_CURRENCIES[currency]) {
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
    }

    const currency_symbol = ALLOWED_CURRENCIES[currency];

    // Verify client ownership
    const clientCheck = await pool.query(
      `SELECT id FROM clients WHERE id = $1 AND user_id = $2`,
      [client_id, user_id]
    );
    if (clientCheck.rowCount === 0) {
      return NextResponse.json({ error: "Invalid client" }, { status: 403 });
    }

    // Calculate totals
    const subtotal = items.reduce(
      (acc, item) => acc + Number(item.quantity) * Number(item.price),
      0
    );
    const total = subtotal + Number(tax) - Number(discount);

    // Insert invoice
    const invoiceResult = await pool.query(
      `
      INSERT INTO invoices (
        user_id,
        client_id,
        invoice_number,
        issue_date,
        due_date,
        currency,
        currency_symbol,
        subtotal,
        tax,
        discount,
        total,
        notes,
        status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *
      `,
      [
        user_id,
        client_id,
        invoice_number,
        issue_date,
        due_date,
        currency,
        currency_symbol,
        subtotal,
        tax,
        discount,
        total,
        notes,
        status,
      ]
    );

    const invoice_id = invoiceResult.rows[0].id;

    // Insert invoice items
    for (const item of items) {
      await pool.query(
        `
        INSERT INTO invoice_items (
          invoice_id,
          description,
          quantity,
          price,
          total
        )
        VALUES ($1,$2,$3,$4,$5)
        `,
        [
          invoice_id,
          item.description,
          item.quantity,
          item.price,
          item.quantity * item.price,
        ]
      );
    }

    return NextResponse.json(
      { success: true, invoice: invoiceResult.rows[0] },
      { status: 201 }
    );

  } catch (error) {
    console.error("Create invoice error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* =========================
   GET ALL INVOICES
========================= */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoiceResult = await pool.query(
      `
      SELECT 
        invoices.*,
        clients.name AS client_name
      FROM invoices
      JOIN clients ON invoices.client_id = clients.id
      WHERE invoices.user_id = $1
      ORDER BY invoices.created_at DESC
      `,
      [session.user.id]
    );

    const invoices = invoiceResult.rows;

    for (const invoice of invoices) {
      const itemsResult = await pool.query(
        `SELECT * FROM invoice_items WHERE invoice_id = $1`,
        [invoice.id]
      );
      invoice.items = itemsResult.rows;
    }

    return NextResponse.json({ invoices });

  } catch (error) {
    console.error("Fetch invoices error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
