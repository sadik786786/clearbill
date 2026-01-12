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
   GET INVOICE BY ID
========================= */
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user_id = session.user.id;
    const { id } = await params;

    const invoiceRes = await pool.query(
      `
      SELECT 
        invoices.*,
        clients.name AS client_name,
        clients.email AS client_email
      FROM invoices
      JOIN clients ON invoices.client_id = clients.id
      WHERE invoices.id = $1 AND invoices.user_id = $2
      `,
      [id, user_id]
    );

    if (invoiceRes.rowCount === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const invoice = invoiceRes.rows[0];

    // Fetch invoice items
    const itemsRes = await pool.query(
      `SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY id ASC`,
      [id]
    );

    invoice.items = itemsRes.rows.map(item => ({
      ...item,
      quantity: Number(item.quantity),
      price: Number(item.price),
      total: Number(item.total),
    }));

    // Ensure numeric types
    invoice.subtotal = Number(invoice.subtotal);
    invoice.tax = Number(invoice.tax);
    invoice.discount = Number(invoice.discount);
    invoice.total = Number(invoice.total);

    return NextResponse.json({ invoice });

  } catch (error) {
    console.error("Fetch invoice error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* =========================
   UPDATE INVOICE
========================= */
export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user_id = session.user.id;
    const { id } = await params;
    const body = await req.json();

    const {
      client_id,
      invoice_number,
      issue_date,
      due_date,
      items = [],
      status = 'pending',
      tax = 0,
      discount = 0,
      notes = "",
      currency_code,
      currency_symbol
    } = body;

    if (!client_id || !invoice_number || !issue_date || !due_date || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const subtotal = items.reduce(
      (acc, item) => acc + Number(item.quantity) * Number(item.price),
      0
    );
    const total = subtotal + Number(tax) - Number(discount);

    await pool.query(
      `
      UPDATE invoices SET
        client_id = $1,
        invoice_number = $2,
        issue_date = $3,
        due_date = $4,
        currency = $5,
        currency_symbol = $6,
        subtotal = $7,
        tax = $8,
        discount = $9,
        total = $10,
        notes = $11,
        status = $12,
        updated_at = NOW()
      WHERE id = $13
      `,
      [
        client_id,
        invoice_number,
        issue_date,
        due_date,
        currency_code,
        currency_symbol,
        subtotal,
        tax,
        discount,
        total,
        notes,
        status,
        id,
      ]
    );

    // Replace invoice items
    await pool.query(`DELETE FROM invoice_items WHERE invoice_id = $1`, [id]);

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
        [id, item.description, item.quantity, item.price, item.quantity * item.price]
      );
    }

    return NextResponse.json({ success: true, message: "Invoice updated successfully" });

  } catch (error) {
    console.error("Update invoice error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* =========================
   DELETE INVOICE
========================= */
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user_id = session.user.id;
    const { id } = await params;

    const invoiceCheck = await pool.query(
      `SELECT id FROM invoices WHERE id = $1 AND user_id = $2`,
      [id, user_id]
    );
    if (invoiceCheck.rowCount === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    await pool.query(`DELETE FROM invoice_items WHERE invoice_id = $1`, [id]);
    await pool.query(`DELETE FROM invoices WHERE id = $1`, [id]);

    return NextResponse.json({ success: true, message: "Invoice deleted successfully" });

  } catch (error) {
    console.error("Delete invoice error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
function getCurrencySymbol(currencyCode, locale = "en-US") {
  if (!currencyCode || !ALLOWED_CURRENCIES[currencyCode]) {
    return "₹"; // default fallback
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
  })
    .formatToParts(1)
    .find(part => part.type === "currency")?.value || "₹";
}
