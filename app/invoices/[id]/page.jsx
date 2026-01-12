'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FiPrinter, FiArrowLeft, FiCalendar, FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase } from "react-icons/fi";

export default function ViewInvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [invoice, setInvoice] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoiceAndClient = async () => {
      try {
        const invoiceRes = await fetch(`/api/invoices/${id}`);
        const invoiceData = await invoiceRes.json();
        
        if (!invoiceRes.ok) {
          setError(invoiceData.error || "Invoice not found");
          setLoading(false);
          return;
        }

        setInvoice(invoiceData.invoice);

        if (invoiceData.invoice?.client_id) {
          try {
            const clientRes = await fetch(`/api/clients/${invoiceData.invoice.client_id}`);
            const clientData = await clientRes.json();
            
            if (clientRes.ok) {
              setClient(clientData);
            }
          } catch (clientError) {
            console.error("Failed to fetch client details:", clientError);
          }
        }

      } catch (err) {
        console.error(err);
        setError("Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoiceAndClient();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount, symbol = "$") => {
    return `${symbol}${Number(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-3 text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Invoice Not Found</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/invoices")}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  const subtotal = invoice.items.reduce(
    (acc, item) => acc + Number(item.quantity) * Number(item.price),
    0
  );
  const total = subtotal + Number(invoice.tax) - Number(invoice.discount);
  const balanceDue = invoice.paid_amount > 0 ? total - invoice.paid_amount : total;

  return (
    <div className="min-h-screen bg-gray-50 p-4 print:p-0 print:bg-white">
      <div className="max-w-3xl mx-auto print:max-w-full print:m-0">
        {/* Header Actions - Hidden when printing */}
        <div className="mb-6 print:hidden">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => router.push("/invoices")}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <FiArrowLeft />
              <span>Back to Invoices</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/invoices/${id}/edit`)}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm"
              >
                Edit
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                <FiPrinter />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Container */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden print:border-0 print:rounded-none print:shadow-none">
          {/* Invoice Header */}
          <div className="p-6 print:p-4 border-b">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold text-gray-900 print:text-lg">INVOICE</h1>
                <p className="text-gray-600 text-sm print:text-xs">#{invoice.invoice_number}</p>
              </div>
              <div className="text-right">
                <h2 className="text-lg font-bold text-gray-900 print:text-base">ClearBill</h2>
                <p className="text-gray-600 text-sm print:text-xs">Professional Billing</p>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="p-6 print:p-4">
            {/* Bill From & Bill To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4 mb-6 print:mb-4">
              {/* Bill From - Using session user data */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 print:text-xs">Bill From</h3>
                <div className="space-y-1 print:space-y-0">
                  <p className="font-medium text-gray-900 print:text-sm">{session?.user?.name || "Your Company"}</p>
                  {session?.user?.email && (
                    <p className="text-gray-600 print:text-sm">{session.user.email}</p>
                  )}
                  <p className="text-gray-600 print:text-sm">Invoice generated via ClearBill</p>
                </div>
              </div>

              {/* Bill To - Client data */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 print:text-xs">Bill To</h3>
                <div className="space-y-1 print:space-y-0">
                  <p className="font-medium text-gray-900 print:text-sm">{client?.name || invoice.client_name || "Client"}</p>
                  {client?.company && (
                    <p className="text-gray-600 print:text-sm">{client.company}</p>
                  )}
                  {client?.email && (
                    <p className="text-gray-600 print:text-sm">{client.email}</p>
                  )}
                  {client?.phone && (
                    <p className="text-gray-600 print:text-sm">{client.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Invoice Dates */}
            <div className="grid grid-cols-2 gap-4 mb-6 print:mb-4 print:gap-2">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1 print:text-xs">Issue Date</p>
                <p className="text-gray-900 print:text-sm">{formatDate(invoice.issue_date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1 print:text-xs">Due Date</p>
                <p className="text-gray-900 print:text-sm">{formatDate(invoice.due_date)}</p>
              </div>
            </div>

            {/* Items Table - Compact for printing */}
            <div className="mb-6 print:mb-4">
              <div className="overflow-x-auto print:overflow-visible">
                <table className="w-full text-sm print:text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-gray-700">Description</th>
                      <th className="text-right py-2 font-medium text-gray-700">Qty</th>
                      <th className="text-right py-2 font-medium text-gray-700">Price</th>
                      <th className="text-right py-2 font-medium text-gray-700">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 text-gray-900">{item.description}</td>
                        <td className="py-2 text-right text-gray-700">{item.quantity}</td>
                        <td className="py-2 text-right text-gray-700">
                          {formatCurrency(item.price, invoice.currency_symbol || "$")}
                        </td>
                        <td className="py-2 text-right font-medium text-gray-900">
                          {formatCurrency(item.quantity * item.price, invoice.currency_symbol || "$")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals - Compact layout */}
            <div className="flex justify-end">
              <div className="w-full md:w-2/5">
                <div className="space-y-2 print:space-y-1">
                  <div className="flex justify-between text-gray-700 print:text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal, invoice.currency_symbol || "$")}</span>
                  </div>
                  
                  {invoice.tax > 0 && (
                    <div className="flex justify-between text-gray-700 print:text-sm">
                      <span>Tax</span>
                      <span>{formatCurrency(invoice.tax, invoice.currency_symbol || "$")}</span>
                    </div>
                  )}
                  
                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-gray-700 print:text-sm">
                      <span>Discount</span>
                      <span>-{formatCurrency(invoice.discount, invoice.currency_symbol || "$")}</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>TOTAL</span>
                      <span>{formatCurrency(total, invoice.currency_symbol || "$")}</span>
                    </div>
                    
                    {invoice.paid_amount > 0 && total > invoice.paid_amount && (
                      <div className="flex justify-between text-gray-700 print:text-sm mt-1">
                        <span>Balance Due</span>
                        <span className="font-medium">{formatCurrency(balanceDue, invoice.currency_symbol || "$")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Status - Only show on screen, not print */}
            <div className="mt-6 print:hidden">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded text-sm font-medium ${
                  invoice.status === 'paid' 
                    ? 'bg-green-100 text-green-800' 
                    : invoice.status === 'overdue'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {invoice.status?.toUpperCase() || 'PENDING'}
                </span>
                <span className="text-sm text-gray-600">
                  {invoice.status === 'paid' ? 'Paid' : 'Balance due: ' + formatCurrency(balanceDue, invoice.currency_symbol || "$")}
                </span>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mt-6 pt-4 border-t print:mt-4 print:pt-2">
                <p className="text-sm font-medium text-gray-700 mb-1 print:text-xs">Notes</p>
                <p className="text-gray-600 text-sm print:text-xs">{invoice.notes}</p>
              </div>
            )}

            {/* Print Footer */}
            <div className="mt-8 pt-4 border-t text-center text-gray-500 text-xs print:mt-4 print:pt-2">
              <p>Thank you for your business!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 12px !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          @page {
            margin: 0.75cm;
            size: A4;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          * {
            color: #000 !important;
          }
          
          table {
            border-collapse: collapse;
            width: 100% !important;
          }
          
          th, td {
            border: 1px solid #ddd !important;
            padding: 4px 6px !important;
          }
          
          .border {
            border-color: #ddd !important;
          }
          
          .bg-white {
            background: white !important;
          }
          
          .print\\:border-0 {
            border: 0 !important;
          }
          
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          /* Ensure invoice fits on one page */
          .max-w-3xl {
            max-width: 100% !important;
            margin: 0 !important;
          }
          
          /* Optimize spacing for print */
          .print\\:p-4 {
            padding: 16px !important;
          }
          
          .print\\:text-xs {
            font-size: 10px !important;
          }
          
          .print\\:text-sm {
            font-size: 11px !important;
          }
          
          .print\\:text-base {
            font-size: 12px !important;
          }
          
          .print\\:text-lg {
            font-size: 14px !important;
          }
          
          /* Remove all icons in print */
          svg {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}