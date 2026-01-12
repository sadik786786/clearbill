'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { FiPlus, FiTrash2, FiArrowLeft, FiSave, FiCalendar, FiDollarSign, FiFileText, FiUser } from "react-icons/fi";

const CURRENCIES = [
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "INR", symbol: "₹", label: "INR (₹)" },
  { code: "EUR", symbol: "€", label: "EUR (€)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-800" },
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "paid", label: "Paid", color: "bg-green-100 text-green-800" },
  { value: "overdue", label: "Overdue", color: "bg-red-100 text-red-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-purple-100 text-purple-800" }
];

const getStatusBadge = (status) => {
  const option = STATUS_OPTIONS.find(s => s.value === status);
  if (!option) return null;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${option.color}`}>
      {option.label}
    </span>
  );
};

export default function EditInvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      client_id: "",
      invoice_number: "",
      issue_date: "",
      due_date: "",
      status: "draft",
      currency_code: "USD",
      currency_symbol: "$",
      items: [{ description: "", quantity: 1, price: 0 }],
      tax: 0,
      discount: 0,
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const {
    items = [],
    tax = 0,
    discount = 0,
    currency_code,
    currency_symbol,
    issue_date,
    status,
  } = watch();

  const subtotal = items.reduce(
    (acc, item) =>
      acc + Number(item.quantity || 0) * Number(item.price || 0),
    0
  );

  const total = subtotal + Number(tax) - Number(discount);

  useEffect(() => {
    const selected = CURRENCIES.find(c => c.code === currency_code);
    if (selected) {
      setValue("currency_symbol", selected.symbol);
    }
  }, [currency_code, setValue]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, invoiceRes] = await Promise.all([
          fetch("/api/clients"),
          fetch(`/api/invoices/${id}`),
        ]);

        if (!clientsRes.ok || !invoiceRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const clientsData = await clientsRes.json();
        const invoiceData = await invoiceRes.json();

        if (!invoiceData || !invoiceData.invoice) {
          alert("Invoice not found");
          router.push("/invoices");
          return;
        }

        const invoice = invoiceData.invoice;
        setInvoiceData(invoice);
        setClients(clientsData);

        reset({
          client_id: invoice.client_id || "",
          invoice_number: invoice.invoice_number || "",
          issue_date: invoice.issue_date?.split('T')[0] || "",
          due_date: invoice.due_date?.split('T')[0] || "",
          status: invoice.status || "draft",
          currency_code: invoice.currency_code || "USD",
          currency_symbol: invoice.currency_symbol || "$",
          tax: Number(invoice.tax || 0),
          discount: Number(invoice.discount || 0),
          notes: invoice.notes || "",
          items: invoice.items && invoice.items.length > 0 
            ? invoice.items.map(item => ({
                description: item.description || "",
                quantity: Number(item.quantity) || 1,
                price: Number(item.price) || 0,
              }))
            : [{ description: "", quantity: 1, price: 0 }],
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        alert("Failed to load invoice data");
        router.push("/invoices");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, reset, router]);

  const onSubmit = async (data) => {
    if (data.items.length === 0) {
      alert("Add at least one item");
      return;
    }

    // Validate items
    const invalidItem = data.items.find(item => 
      !item.description.trim() || 
      item.quantity <= 0 || 
      item.price < 0
    );
    
    if (invalidItem) {
      alert("Please ensure all items have a description, quantity greater than 0, and price not negative");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...data,
        subtotal,
        total,
      };

      const res = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const response = await res.json();

      if (res.ok) {
        alert("Invoice updated successfully!");
        router.push("/invoices");
      } else {
        alert(response.error || "Failed to update invoice");
      }
    } catch (err) {
      console.error(err);
      alert("Server error while updating invoice");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteInvoice = async () => {
    if (!confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Invoice deleted successfully!");
        router.push("/invoices");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete invoice");
      }
    } catch (err) {
      console.error(err);
      alert("Server error while deleting invoice");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading invoice data...</p>
          <p className="text-sm text-gray-500 mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/invoices")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <FiArrowLeft />
            <span>Back to Invoices</span>
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Invoice</h1>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-gray-600">Invoice #{invoiceData?.invoice_number}</p>
                {status && getStatusBadge(status)}
              </div>
              <p className="text-gray-500 mt-1">Update invoice details and items</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleDeleteInvoice}
                className="px-4 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors hover:shadow-sm"
              >
                Delete Invoice
              </button>
              <button
                type="button"
                onClick={() => router.push("/invoices")}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors hover:shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-invoice-form"
                disabled={saving}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSave />
                <span>{saving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>

        <form id="edit-invoice-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Client Information */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiUser className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Client Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Client *</label>
                <select 
                  {...register("client_id", { required: "Please select a client" })} 
                  className={`w-full p-3 border ${errors.client_id ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                >
                  <option value="">Choose a client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} - {client.email} {client.company ? `(${client.company})` : ''}
                    </option>
                  ))}
                </select>
                {errors.client_id && (
                  <p className="mt-2 text-sm text-red-600">{errors.client_id.message}</p>
                )}
              </div>
              
              {invoiceData?.client && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{invoiceData.client.name}</p>
                      <p className="text-sm text-gray-600 mt-1">{invoiceData.client.email}</p>
                      {invoiceData.client.phone && (
                        <p className="text-sm text-gray-600">Phone: {invoiceData.client.phone}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => window.open(`/clients/${invoiceData.client_id}`, '_blank')}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      View Profile →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Details */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiCalendar className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Invoice Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number *</label>
                <input 
                  {...register("invoice_number", { required: "Invoice number is required" })} 
                  className={`w-full p-3 border ${errors.invoice_number ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                  placeholder="INV-001"
                />
                {errors.invoice_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.invoice_number.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select 
                  {...register("status")} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select 
                  {...register("currency_code")} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date *</label>
                <input 
                  type="date" 
                  {...register("issue_date", { required: "Issue date is required" })} 
                  className={`w-full p-3 border ${errors.issue_date ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                />
                {errors.issue_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.issue_date.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                <input 
                  type="date" 
                  {...register("due_date", { 
                    required: "Due date is required",
                    validate: value => {
                      if (new Date(value) < new Date(issue_date)) {
                        return "Due date cannot be before issue date";
                      }
                      return true;
                    }
                  })} 
                  className={`w-full p-3 border ${errors.due_date ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                />
                {errors.due_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.due_date.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiDollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Invoice Items</h2>
              </div>
              <button
                type="button"
                onClick={() => append({ description: "", quantity: 1, price: 0 })}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md"
              >
                <FiPlus />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Table Headers */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 rounded-lg">
                <div className="col-span-6 font-medium text-gray-700">Description</div>
                <div className="col-span-2 font-medium text-gray-700">Quantity</div>
                <div className="col-span-3 font-medium text-gray-700">Price ({currency_symbol})</div>
                <div className="col-span-1 font-medium text-gray-700">Action</div>
              </div>

              {fields.map((item, index) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 bg-gray-50/50 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="md:col-span-6">
                    <input
                      {...register(`items.${index}.description`, { required: "Description is required" })}
                      placeholder="Item description *"
                      className={`w-full p-3 border ${errors.items?.[index]?.description ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                    />
                    {errors.items?.[index]?.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.items[index].description.message}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="number"
                      min="1"
                      {...register(`items.${index}.quantity`, { 
                        valueAsNumber: true,
                        required: "Quantity is required",
                        min: { value: 1, message: "Quantity must be at least 1" }
                      })}
                      placeholder="Qty"
                      className={`w-full p-3 border ${errors.items?.[index]?.quantity ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                    />
                    {errors.items?.[index]?.quantity && (
                      <p className="mt-1 text-sm text-red-600">{errors.items[index].quantity.message}</p>
                    )}
                  </div>
                  <div className="md:col-span-3">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register(`items.${index}.price`, { 
                        valueAsNumber: true,
                        required: "Price is required",
                        min: { value: 0, message: "Price cannot be negative" }
                      })}
                      placeholder="Price"
                      className={`w-full p-3 border ${errors.items?.[index]?.price ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                    />
                    {errors.items?.[index]?.price && (
                      <p className="mt-1 text-sm text-red-600">{errors.items[index].price.message}</p>
                    )}
                  </div>
                  <div className="md:col-span-1">
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="w-full p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove item"
                      >
                        <FiTrash2 className="mx-auto" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals & Notes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Totals */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tax ({currency_symbol})</label>
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      {...register("tax", { valueAsNumber: true })} 
                      placeholder="0.00"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount ({currency_symbol})</label>
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      {...register("discount", { valueAsNumber: true })} 
                      placeholder="0.00"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-lg font-semibold text-gray-900">{currency_symbol}{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tax:</span>
                    <span className="text-gray-900">{currency_symbol}{Number(tax).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-gray-900">-{currency_symbol}{Number(discount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="text-xl font-bold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">{currency_symbol}{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FiFileText className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Additional Information</h2>
              </div>
              <textarea 
                {...register("notes")} 
                className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Add any additional notes, payment terms, or special instructions..."
                rows="6"
              />
              <p className="mt-2 text-sm text-gray-500">
                This information will be displayed on the invoice.
              </p>
            </div>
          </div>

          {/* Save Buttons */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  Last updated: {invoiceData?.updated_at ? new Date(invoiceData.updated_at).toLocaleString() : 'N/A'}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => router.push("/invoices")}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors hover:shadow-sm"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving Changes...
                    </span>
                  ) : "Save Invoice"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}