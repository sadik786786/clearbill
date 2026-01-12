'use client';

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { X, User, Mail, Phone, Building, MapPin, CheckCircle } from "lucide-react";

export default function AddClientModal({ onClose, onSuccess, client }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  // Pre-fill form when editing
  useEffect(() => {
    if (client) {
      reset({
        name: client.name,
        email: client.email,
        phone: client.phone || "",
        company: client.company || "",
        address: client.address || "",
      });
    } else {
      reset({
        name: "",
        email: "",
        phone: "",
        company: "",
        address: "",
      });
    }
  }, [client, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const method = client ? "PUT" : "POST";
      const url = client
        ? `/api/clients/${client.id}`
        : "/api/clients";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving client:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 transform transition-all duration-300 scale-100">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {client ? "Client Updated!" : "Client Added!"}
            </h3>
            <p className="text-gray-600 mb-8">
              {client ? "Client details have been successfully updated." : "New client has been successfully added to your system."}
            </p>
            <div className="animate-pulse">
              <div className="h-1 w-32 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {client ? "Edit Client" : "Add New Client"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {client ? "Update existing client information" : "Add a new client to your database"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 group"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <User className="w-4 h-4" />
              Full Name *
            </label>
            <div className="relative">
              <input
                placeholder="John Doe"
                className={`w-full px-4 py-3 pl-11 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200
                  ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                {...register("name", { 
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters"
                  }
                })}
              />
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {errors.name && (
              <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Mail className="w-4 h-4" />
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="john@example.com"
                className={`w-full px-4 py-3 pl-11 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200
                  ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Grid for Phone and Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Phone Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <div className="relative">
                <input
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 pl-11 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-300"
                  {...register("phone")}
                />
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Company Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Building className="w-4 h-4" />
                Company
              </label>
              <div className="relative">
                <input
                  placeholder="Acme Inc."
                  className="w-full px-4 py-3 pl-11 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-300"
                  {...register("company")}
                />
                <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Address Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <MapPin className="w-4 h-4" />
              Address
            </label>
            <div className="relative">
              <textarea
                placeholder="123 Main St, City, State 12345"
                rows="3"
                className="w-full px-4 py-3 pl-11 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-300 resize-none"
                {...register("address")}
              />
              <MapPin className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 flex-1 shadow-lg shadow-blue-500/20"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {client ? "Updating..." : "Saving..."}
                </>
              ) : (
                <>
                  {client ? "Update Client" : "Add Client"}
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Note */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Fields marked with * are required. All information is securely stored.
          </p>
        </div>
      </div>
    </div>
  );
}