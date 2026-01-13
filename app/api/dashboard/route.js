import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  console.log("Fetching dashboard data for user:", userId);
  const [
  totalInvoices,
  totalRevenue,
  statusCounts,
  overdueCount,
  recentInvoices,
  monthlyRevenue
] = await Promise.all([
  pool.query(
    "SELECT COUNT(*) FROM invoices WHERE user_id = $1",
    [userId]
  ),

  pool.query(
    "SELECT COALESCE(SUM(total), 0) FROM invoices WHERE status = 'paid' AND user_id = $1",
    [userId]
  ),

  pool.query(
    "SELECT status, COUNT(*) FROM invoices WHERE user_id = $1 GROUP BY status",
    [userId]
  ),

  pool.query(
    "SELECT COUNT(*) FROM invoices WHERE status = 'unpaid' AND due_date < CURRENT_DATE AND user_id = $1",
    [userId]
  ),

  pool.query(
    `
    SELECT 
      i.id,
      c.name AS client,
      i.total,
      i.currency,
      i.status,
      i.created_at
    FROM invoices i
    JOIN clients c ON c.id = i.client_id
    WHERE i.user_id = $1
    ORDER BY i.created_at DESC
    LIMIT 5
    `,
    [userId]
  ),

  pool.query(
    `
    SELECT
      DATE_TRUNC('month', created_at) AS month,
      SUM(total) AS revenue
    FROM invoices
    WHERE status = 'paid' AND user_id = $1
    GROUP BY month
    ORDER BY month
    `,
    [userId]
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
