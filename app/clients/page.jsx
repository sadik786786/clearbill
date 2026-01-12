'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Add this import
import AddClientModal from "../components/AddClientModal";
import {
  FiUserPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiMail,
  FiPhone,
  FiBriefcase
} from "react-icons/fi";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter(); // Initialize router

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this client?");
    if (!confirm) return;

    try {
      await fetch(`/api/clients/${id}`, { method: "DELETE" });
      fetchClients();
    } catch (error) {
      console.error("Failed to delete client:", error);
    }
  };

  // Handle row click
  const handleRowClick = (client, e) => {
    // Prevent navigation if user clicked on action buttons
    if (e.target.closest('button')) {
      return;
    }
    router.push(`/clients/${client.id}`);
  };

  const filteredClients = clients.filter(client => 
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
              <p className="text-gray-600 mt-1">
                {clients.length} {clients.length === 1 ? 'client' : 'clients'} total
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedClient(null);
                setOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <FiUserPlus className="text-lg" />
              <span>Add Client</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative max-w-md mb-6">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-3 text-gray-600">Loading clients...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <FiUserPlus className="text-2xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {searchTerm ? "No clients found" : "No clients yet"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? "Try a different search term"
                  : "Add your first client to get started"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setOpen(true)}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add First Client
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-4 font-medium text-gray-700">Name</th>
                    <th className="text-left p-4 font-medium text-gray-700">Contact</th>
                    <th className="text-left p-4 font-medium text-gray-700">Company</th>
                    <th className="text-left p-4 font-medium text-gray-700">Status</th>
                    <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client, index) => (
                    <tr 
                      key={client.id}
                      className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={(e) => handleRowClick(client, e)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                            {client.name?.charAt(0) || "C"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{client.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <FiMail className="text-gray-400 text-sm" />
                            <span className="text-gray-700 text-sm">{client.email || "-"}</span>
                          </div>
                          {client.phone && (
                            <div className="flex items-center gap-2">
                              <FiPhone className="text-gray-400 text-sm" />
                              <span className="text-gray-700 text-sm">{client.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FiBriefcase className="text-gray-400 text-sm" />
                          <span className="text-gray-700">{client.company || "-"}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          client.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : client.status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {client.status?.toUpperCase() || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click
                              setSelectedClient(client);
                              setOpen(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click
                              handleDelete(client.id);
                            }}
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
          {!loading && filteredClients.length > 0 && (
            <div className="p-4 border-t bg-gray-50 text-sm text-gray-500">
              Showing {filteredClients.length} of {clients.length} clients
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {open && (
        <AddClientModal
          client={selectedClient}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            fetchClients();
          }}
        />
      )}
    </div>
  );
}