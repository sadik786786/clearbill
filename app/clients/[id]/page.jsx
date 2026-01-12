'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, FileText, Plus, Calendar, DollarSign, CheckCircle, Clock, XCircle, Trash2 } from "lucide-react";

export default function ClientDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [client, setClient] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [clientRes, invoicesRes] = await Promise.all([
        fetch(`/api/clients/${id}`),
        fetch(`/api/clients/${id}/invoices`)
      ]);

      const clientData = await clientRes.json();
      const invoiceData = await invoicesRes.json();

      if (!clientRes.ok) {
        setError(clientData.error || "Client not found");
        return;
      }

      setClient(clientData);
      setInvoices(invoiceData.invoices || []);
    } catch (err) {
      console.error(err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
      return;
    }

    setDeletingId(invoiceId);
    setShowDeleteConfirm(null);

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the deleted invoice from state
        setInvoices(invoices.filter(invoice => invoice.id !== invoiceId));
        
        // Show success message
        alert("Invoice deleted successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to delete invoice: ${errorData.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete invoice. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return "bg-green-100 text-green-800";
      case 'pending': return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center mx-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
              <p className="text-gray-600 mt-1">{client.email}</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/clients/${id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Client
              </Link>
              <Link
                href={`/invoices/create?client=${id}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Invoice
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Client Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              
              <div className="space-y-5">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-medium">{client.email || "—"}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="font-medium">{client.phone || "—"}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Company</p>
                  <p className="font-medium">{client.company || "—"}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Address</p>
                  <p className="font-medium">{client.address || "—"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Invoices Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-blue-600 mr-3" />
                    <h2 className="text-lg font-semibold text-gray-900">Invoices</h2>
                  </div>
                  <span className="bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
                    {invoices.length} total
                  </span>
                </div>
              </div>

              {invoices.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No invoices found</p>
                  <p className="text-sm text-gray-400">Create the first invoice for this client</p>
                  <Link
                    href={`/invoices/create?client=${id}`}
                    className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Invoice
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="p-6 hover:bg-gray-50 transition-colors group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900">
                              #{invoice.invoice_number}
                            </h3>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                              {getStatusIcon(invoice.status)}
                              {invoice.status || "Pending"}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(invoice.issue_date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span className="font-medium">
                                {invoice.currency || "USD"} {Number(invoice.total).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Link
                            href={`/invoices/${invoice.id}`}
                            className="px-3 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            View
                          </Link>
                          <Link
                            href={`/invoices/${invoice.id}/edit`}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            disabled={deletingId === invoice.id}
                            className="px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {deletingId === invoice.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            {invoices.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Paid Invoices</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {invoices.filter(inv => inv.status?.toLowerCase() === 'paid').length}
                      </p>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Pending Invoices</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {invoices.filter(inv => inv.status?.toLowerCase() === 'pending').length}
                      </p>
                    </div>
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}