import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    totalInvoices,
    totalRevenue,
    statusCounts,
    overdueCount,
    recentInvoices,
    monthlyRevenue
  ] = await Promise.all([
    pool.query("SELECT COUNT(*) FROM invoices"),
    pool.query("SELECT COALESCE(SUM(total),0) FROM invoices WHERE status='paid'"),
    pool.query("SELECT status, COUNT(*) FROM invoices GROUP BY status"),
    pool.query(
      "SELECT COUNT(*) FROM invoices WHERE status='unpaid' AND due_date < CURRENT_DATE"
    ),
    pool.query(
      `
      SELECT i.id, c.name AS client, i.total,i.currency, i.status, i.created_at
      FROM invoices i
      JOIN clients c ON c.id = i.client_id
      ORDER BY i.created_at DESC
      LIMIT 5
      `
    ),
    pool.query(
      `
      SELECT
  created_at AS month,
  total AS revenue
FROM invoices
WHERE status = 'paid'
ORDER BY created_at;

      `
    )
  ]);

  return NextResponse.json({
    totalInvoices: totalInvoices.rows[0].count,
    totalRevenue: totalRevenue.rows[0].coalesce,
    statusCounts: statusCounts.rows,
    overdueInvoices: overdueCount.rows[0].count,
    recentInvoices: recentInvoices.rows,
    monthlyRevenue: monthlyRevenue.rows
  });
}
