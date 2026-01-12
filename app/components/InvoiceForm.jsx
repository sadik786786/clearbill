'use client';

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { FiPlus, FiTrash2, FiFileText, FiCalendar, FiDollarSign } from "react-icons/fi";
import { useRouter } from "next/navigation";

const currencySymbol = (code) => {
  switch (code) {
    case "INR": return "₹";
    case "EUR": return "€";
    case "GBP": return "£";
    default: return "$";
  }
};

const statusOptions = [
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "paid", label: "Paid", color: "bg-green-100 text-green-800" },
  { value: "overdue", label: "Overdue", color: "bg-red-100 text-red-800" },
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-800" }
];

export default function InvoiceForm() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  
  const { register, control, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      client_id: "",
      invoice_number: "",
      issue_date: new Date().toISOString().split('T')[0],
      due_date: "",
      currency: "USD",
      status: "pending",
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

  const { items = [], tax = 0, discount = 0, currency, issue_date } = watch();

  const subtotal = items.reduce(
    (acc, item) =>
      acc + Number(item.quantity || 0) * Number(item.price || 0),
    0
  );

  const total = subtotal + Number(tax) - Number(discount);

  useEffect(() => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((data) => setClients(data))
      .catch((err) => console.error("Failed to fetch clients", err));
  }, []);

  const onSubmit = async (data) => {
    if (!data.client_id) {
      alert("Please select a client");
      return;
    }
    if (data.items.length === 0) {
      alert("Add at least one item");
      return;
    }

    // Validate that all items have description, quantity > 0, and price >= 0
    const invalidItem = data.items.find(item => 
      !item.description.trim() || 
      item.quantity <= 0 || 
      item.price < 0
    );
    
    if (invalidItem) {
      alert("Please ensure all items have a description, quantity greater than 0, and price not negative");
      return;
    }

    const payload = {
      ...data,
      subtotal,
      total,
    };

    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to create invoice");
        return;
      }
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/invoices');
      }, 1500);
      
    } catch (error) {
      console.error(error);
      alert("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
          <p className="text-gray-600 mt-2">Fill in the details below to create a new invoice</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Client Selection */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiFileText className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Client Information</h2>
            </div>
            <select 
              {...register("client_id", { required: "Client is required" })} 
              className={`w-full p-3 border ${errors.client_id ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.email}
                </option>
              ))}
            </select>
            {errors.client_id && (
              <p className="mt-2 text-sm text-red-600">{errors.client_id.message}</p>
            )}
          </div>

          {/* Invoice Details */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
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
                  placeholder="e.g., INV-001"
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
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select 
                  {...register("currency", { required: true })} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
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
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 rounded-lg">
                <div className="col-span-6 font-medium text-gray-700">Description</div>
                <div className="col-span-2 font-medium text-gray-700">Quantity</div>
                <div className="col-span-3 font-medium text-gray-700">Price ({currencySymbol(currency)})</div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tax ({currencySymbol(currency)})</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount ({currencySymbol(currency)})</label>
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
                    <span className="text-lg font-semibold text-gray-900">{currencySymbol(currency)}{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tax:</span>
                    <span className="text-gray-900">{currencySymbol(currency)}{Number(tax).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-gray-900">-{currencySymbol(currency)}{Number(discount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="text-xl font-bold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">{currencySymbol(currency)}{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
              <textarea 
                {...register("notes")} 
                placeholder="Add any additional notes, payment terms, or special instructions..."
                className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                rows="6"
              />
              <p className="mt-2 text-sm text-gray-500">
                This information will be displayed on the invoice.
              </p>
            </div>
          </div>

          {/* Submit Section */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                {success && (
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                    <div className="p-2 bg-green-100 rounded-full">
                      <FiFileText className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800">Invoice created successfully!</p>
                      <p className="text-sm text-green-600">Redirecting to invoices page...</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button 
                  type="button" 
                  onClick={() => {
                    if (confirm("Are you sure you want to reset the form? All entered data will be lost.")) {
                      reset();
                    }
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors hover:shadow-sm"
                >
                  Reset Form
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Invoice...
                    </span>
                  ) : "Create Invoice"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}