'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiFileText, FiEdit2, FiTrash2, FiEye, FiPlus } from "react-icons/fi";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch invoices
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();
      setInvoices(data.invoices || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Delete invoice
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;

    try {
      const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchInvoices();
      } else {
        alert(data.error || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  // Format currency
  const formatCurrency = (amount, symbol = "$") => {
    return `${symbol}${Number(amount).toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
              <p className="text-gray-600 mt-1">
                {invoices.length} {invoices.length === 1 ? 'invoice' : 'invoices'} total
              </p>
            </div>

            <Link
              href="/invoices/create"
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <FiPlus className="text-lg" />
              <span>New Invoice</span>
            </Link>
          </div>
        </div>

        {/* Invoice Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-3 text-gray-600">Loading invoices...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <FiFileText className="text-2xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No invoices yet
              </h3>
              <p className="text-gray-500 mb-6">
                Create your first invoice to get started
              </p>
              <Link
                href="/invoices/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus />
                <span>Create Invoice</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-50 border-b">
                    <th className="text-left p-4 font-medium text-gray-700">Invoice #</th>
                    <th className="text-left p-4 font-medium text-gray-700">Client</th>
                    <th className="text-left p-4 font-medium text-gray-700">Issue Date</th>
                    <th className="text-left p-4 font-medium text-gray-700">Due Date</th>
                    <th className="text-left p-4 font-medium text-gray-700">Total</th>
                    <th className="text-left p-4 font-medium text-gray-700">Status</th>
                    <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">
                        {inv.invoice_number}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">
                          {inv.client_name}
                        </div>
                      </td>
                      <td className="p-4 text-gray-700">
                        {formatDate(inv.issue_date)}
                      </td>
                      <td className="p-4 text-gray-700">
                        {formatDate(inv.due_date)}
                      </td>
                      <td className="p-4 font-medium text-gray-900">
                        {formatCurrency(inv.total, inv.currency_symbol || "$")}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          inv.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : inv.status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {inv.status?.toUpperCase() || 'PENDING'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <FiEye />
                          </Link>
                          <Link
                            href={`/invoices/${inv.id}/edit`}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 />
                          </Link>
                          <button
                            onClick={() => handleDelete(inv.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Simple Footer */}
          {!loading && invoices.length > 0 && (
            <div className="p-4 border-t bg-gray-50 text-sm text-gray-500">
              Showing {invoices.length} invoices
            </div>
          )}
        </div>
      </div>
    </div>
  );
}