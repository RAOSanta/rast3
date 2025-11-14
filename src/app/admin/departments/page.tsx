"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { AdminLayout } from "~/app/_components/admin-layout";

// Define types based on what's returned from the API
type Department = {
  id: string;
  name: string;
  domain: string;
  createdAt: Date;
  updatedAt: Date;
};

type DepartmentsByDomain = Record<string, Department[]>;

export default function DepartmentsPage() {
  return (
    <AdminLayout>
      <DepartmentManagement />
    </AdminLayout>
  );
}

function DepartmentManagement() {
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newDepartmentDomain, setNewDepartmentDomain] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Add state for editing/deleting departments
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null);
  const [editingDepartmentName, setEditingDepartmentName] = useState<string>("");
  const [editingDepartmentDomain, setEditingDepartmentDomain] = useState<string>("");
  const [deletingDepartmentId, setDeletingDepartmentId] = useState<string | null>(null);

  // Get current user profile to check permissions
  const { data: userProfile } = api.profile.getCurrentProfile.useQuery();
  
  // Get departments and domains (now scoped based on user's admin level)
  const { data: departments, refetch } = api.profile.getDepartmentsByDomain.useQuery({
    domain: "all",
  });
  
  const { data: domains } = api.domain.getAll.useQuery();

  // Check if user can create departments (SITE or DOMAIN admins only)
  const canCreateDepartments = userProfile?.adminLevel === "SITE" || userProfile?.adminLevel === "DOMAIN";

  const createDepartmentMutation = api.profile.createDepartment.useMutation({
    onSuccess: () => {
      setNewDepartmentName("");
      setNewDepartmentDomain("");
      setIsCreating(false);
      void refetch();
    },
    onError: (error) => {
      alert(`Failed to create department: ${error.message}`);
      setIsCreating(false);
    },
  });

  const updateDepartmentMutation = api.profile.updateDepartment.useMutation({
    onSuccess: () => {
      setEditingDepartmentId(null);
      setEditingDepartmentName("");
      setEditingDepartmentDomain("");
      void refetch();
    },
    onError: (error) => {
      alert(`Failed to update department: ${error.message}`);
    },
  });

  const deleteDepartmentMutation = api.profile.deleteDepartment.useMutation({
    onSuccess: () => {
      setDeletingDepartmentId(null);
      void refetch();
    },
    onError: (error) => {
      alert(`Failed to delete department: ${error.message}`);
      setDeletingDepartmentId(null);
    },
  });

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartmentName.trim() || !newDepartmentDomain.trim()) return;

    setIsCreating(true);
    try {
      await createDepartmentMutation.mutateAsync({
        name: newDepartmentName.trim(),
        domain: newDepartmentDomain.trim().toLowerCase(),
      });    } catch {
      setIsCreating(false);
    }
  };
  // Group departments by domain
  const departmentsByDomain: DepartmentsByDomain = departments?.reduce((acc: DepartmentsByDomain, dept: Department) => {
    const domain = dept.domain;    acc[domain] ??= [];
    acc[domain].push(dept);
    return acc;
  }, {}) ?? {};

  return (
    <div className="w-full max-w-6xl">
      <h1 className="mb-8 text-3xl font-bold text-white">
        Department Management
      </h1>      {/* Domain Status Overview */}
      <div className="mb-8 rounded-lg bg-black/85 backdrop-blur-sm p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">Domain Status</h2>        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {domains?.map((domain) => (
            <div key={domain.id} className="rounded-lg bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-white">{domain.name}</h3>
                <span className={`rounded-full px-2 py-1 text-xs ${
                  domain.enabled 
                    ? "bg-green-600 text-white" 
                    : "bg-red-600 text-white"
                }`}>
                  {domain.enabled ? "Enabled" : "Disabled"}
                </span>
              </div>                <p className="mt-1 text-sm text-white/60">
                {(domain as { _count?: { departments: number } })._count?.departments ?? 0} departments
              </p>
            </div>
          ))}        </div>
      </div>

      {/* Create New Department - Only for SITE and DOMAIN admins */}
      {canCreateDepartments && (
        <div className="mb-8 rounded-lg bg-black/85 backdrop-blur-sm p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">
            Add New Department
          </h2>
          <form onSubmit={handleCreateDepartment} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="departmentName" className="block text-sm font-medium text-white">
                Department Name *
              </label>
              <input
                type="text"
                id="departmentName"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-white/20 bg-black/85 backdrop-blur-sm px-3 py-2 text-white placeholder-white/60 shadow-sm focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                placeholder="e.g., Engineering, Marketing, Sales"
                required
              />
            </div>
            <div>
              <label htmlFor="departmentDomain" className="block text-sm font-medium text-white">
                Domain *
              </label>
              <select
                id="departmentDomain"
                value={newDepartmentDomain}
                onChange={(e) => setNewDepartmentDomain(e.target.value)}
                className="mt-1 block w-full rounded-md border border-white/20 bg-black/85 backdrop-blur-sm px-3 py-2 text-white shadow-sm focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                required
              >
                <option value="">Select a domain...</option>
                {domains?.filter((d) => d.enabled).map((domain) => (
                  <option key={domain.id} value={domain.name} className="bg-gray-800">
                    {domain.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isCreating || !newDepartmentName.trim() || !newDepartmentDomain.trim()}
            className="inline-flex items-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Creating...
              </>
            ) : (
              "Add Department"
            )}
          </button>        </form>
        </div>
      )}

      {/* Departments by Domain */}
      <div className="space-y-6">
        {Object.entries(departmentsByDomain).map(([domainName, depts]) => {
          const domain = domains?.find((d) => d.name === domainName);
          return (
            <div key={domainName} className="rounded-lg bg-black/85 backdrop-blur-sm p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  {domainName}
                </h2>
                <span className={`rounded-full px-2 py-1 text-xs ${
                  domain?.enabled 
                    ? "bg-green-600 text-white" 
                    : "bg-red-600 text-white"
                }`}>
                  {domain?.enabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              
              {depts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/20">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/80">
                          Department Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/80">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/80">
                          Actions
                        </th>
                      </tr>
                    </thead>                    <tbody className="divide-y divide-white/10">
                      {depts.map((department: Department) => (
                        <tr key={department.id}>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white">
                            {department.name}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-white/80">
                            {new Date(department.createdAt).toLocaleDateString()}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm">
                            {editingDepartmentId === department.id ? (
                              <>
                                <input
                                  type="text"
                                  value={editingDepartmentName}
                                  onChange={(e) => setEditingDepartmentName(e.target.value)}
                                  className="rounded border border-white/20 bg-black/85 px-2 py-1 text-white mr-2"
                                />
                                <select
                                  value={editingDepartmentDomain}
                                  onChange={(e) => setEditingDepartmentDomain(e.target.value)}
                                  className="rounded border border-white/20 bg-black/85 px-2 py-1 text-white mr-2"
                                >
                                  {domains?.map((d) => (
                                    <option key={d.id} value={d.name}>{d.name}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => updateDepartmentMutation.mutate({
                                    id: department.id,
                                    name: editingDepartmentName,
                                    domain: editingDepartmentDomain,
                                  })}
                                  className="text-green-400 hover:text-green-300 mr-2"
                                  disabled={updateDepartmentMutation.isPending}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingDepartmentId(null)}
                                  className="text-gray-400 hover:text-gray-300"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="text-blue-400 hover:text-blue-300 mr-2"
                                  onClick={() => {
                                    setEditingDepartmentId(department.id);
                                    setEditingDepartmentName(department.name);
                                    setEditingDepartmentDomain(department.domain);
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  className="text-red-400 hover:text-red-300"
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete department '${department.name}'? This cannot be undone.`)) {
                                      setDeletingDepartmentId(department.id);
                                      deleteDepartmentMutation.mutate({ id: department.id });
                                    }
                                  }}
                                  disabled={deleteDepartmentMutation.isPending}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-white/60">No departments in this domain yet.</p>
                </div>
              )}
            </div>
          );
        })}
        
        {Object.keys(departmentsByDomain).length === 0 && (
          <div className="text-center py-8">
            <p className="text-white/60">No departments found. Create one above to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
