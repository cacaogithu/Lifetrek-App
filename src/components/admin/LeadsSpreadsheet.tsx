import { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, RefreshCw, Search } from "lucide-react";
import Papa from "papaparse";

export interface Lead {
  id: string;
  nome_empresa: string;
  website?: string;
  telefone?: string;
  segmento?: string;
  categoria?: string;
  scraped_emails?: any[];
  linkedin_profiles?: any[];
  decision_makers?: any[];
  has_fda: boolean;
  has_ce: boolean;
  has_iso: boolean;
  has_rd: boolean;
  years_in_business: number;
  countries_served: number;
  employee_count: number;
  predicted_score: number;
  v2_score: number;
  enrichment_status: string;
  priority: string;
  last_enriched_at?: string;
  source?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const LeadsSpreadsheet = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "v2_score", desc: true }
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const { toast } = useToast();

  // Generate mock data for local testing
  const generateMockLeads = (): Lead[] => {
    const companies = [
      {
        nome_empresa: "Neodent Brasil",
        website: "https://neodent.com.br",
        telefone: "+55 41 3314-8000",
        segmento: "Dental Implants",
        v2_score: 9.2,
        has_iso: true,
        has_ce: true,
        employee_count: 850,
        priority: "urgent" as const,
      },
      {
        nome_empresa: "Baumer Medical",
        website: "https://baumer.com.br",
        telefone: "+55 11 2139-0393",
        segmento: "Orthopedic Implants",
        v2_score: 8.7,
        has_iso: true,
        has_fda: true,
        has_ce: true,
        employee_count: 320,
        priority: "high" as const,
      },
      {
        nome_empresa: "Lifetrek Medical",
        website: "https://lifetrek.com.br",
        telefone: "+55 19 3404-9300",
        segmento: "Custom Medical Devices",
        v2_score: 8.5,
        has_iso: true,
        has_ce: true,
        employee_count: 150,
        years_in_business: 30,
        priority: "high" as const,
      },
      {
        nome_empresa: "Medicalway",
        website: "https://medicalway.com.br",
        segmento: "Medical Equipment Distribution",
        v2_score: 7.8,
        has_iso: true,
        employee_count: 95,
        priority: "medium" as const,
      },
      {
        nome_empresa: "BioMed Equipamentos",
        website: "https://biomed.ind.br",
        segmento: "Medical Equipment Manufacturing",
        v2_score: 7.2,
        has_iso: true,
        employee_count: 65,
        priority: "medium" as const,
        enrichment_status: "complete" as const,
      },
    ];

    return companies.map((company, index) => ({
      id: `mock-${index}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      nome_empresa: company.nome_empresa,
      website: company.website || null,
      telefone: company.telefone || null,
      segmento: company.segmento || null,
      categoria: null,
      scraped_emails: [],
      linkedin_profiles: [],
      decision_makers: [],
      has_fda: company.has_fda || false,
      has_ce: company.has_ce || false,
      has_iso: company.has_iso || false,
      has_rd: false,
      years_in_business: company.years_in_business || 0,
      countries_served: 0,
      employee_count: company.employee_count || 0,
      predicted_score: 0,
      v2_score: company.v2_score,
      enrichment_status: company.enrichment_status || "pending",
      priority: company.priority,
      last_enriched_at: null,
      source: "mock_data",
      notes: null,
    }));
  };

  // Fetch leads from database
  const fetchLeads = async () => {
    setLoading(true);
    try {
      // Increase limit to fetch all leads (default is usually 1000)
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("v2_score", { ascending: false })
        .limit(5000);

      if (error) throw error;
      
      // If no data from database, use mock data for local testing
      if (!data || data.length === 0) {
        console.log("📝 Using mock data for local testing");
        setLeads(generateMockLeads());
        toast({
          title: "Demo Mode",
          description: "Showing sample leads (database empty)",
        });
      } else {
        setLeads(data);
      }
    } catch (error: any) {
      console.log("⚠️ Database error, using mock data:", error.message);
      setLeads(generateMockLeads());
      toast({
        title: "Demo Mode",
        description: "Using sample leads (database not connected)",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();

    // Set up real-time subscription
    const channel = supabase
      .channel("leads_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leads",
        },
        (payload) => {
          console.log("Lead change detected:", payload);
          fetchLeads(); // Refresh data on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update cell handler
  const handleCellUpdate = async (
    leadId: string,
    field: keyof Lead,
    value: any
  ) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ [field]: value })
        .eq("id", leadId);

      if (error) throw error;

      toast({
        title: "Updated",
        description: "Lead updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Column definitions
  const columns = useMemo<ColumnDef<Lead>[]>(
    () => [
      {
        accessorKey: "nome_empresa",
        header: "Empresa",
        cell: ({ row, getValue }) => (
          <Input
            defaultValue={getValue() as string}
            onBlur={(e) =>
              handleCellUpdate(row.original.id, "nome_empresa", e.target.value)
            }
            className="min-w-[200px]"
          />
        ),
      },
      {
        accessorKey: "segmento",
        header: "Segmento",
        cell: ({ row, getValue }) => (
          <Input
            defaultValue={getValue() as string}
            onBlur={(e) =>
              handleCellUpdate(row.original.id, "segmento", e.target.value)
            }
            className="min-w-[150px]"
          />
        ),
      },
       {
        accessorKey: "scraped_emails",
        header: "Emails",
        cell: ({ row, getValue }) => {
          const emails = getValue() as any[];
          const display = Array.isArray(emails) ? emails.join(", ") : emails;
          return (
             <div className="max-w-[200px] truncate text-xs" title={display}>
              {display || "-"}
             </div>
          );
        },
      },
      {
        accessorKey: "decision_makers",
        header: "Decision Makers",
        cell: ({ row, getValue }) => {
          const dms = getValue() as any[];
          const display = Array.isArray(dms) ? dms.join(", ") : dms;
           return (
             <div className="max-w-[250px] truncate text-xs" title={display}>
              {display || "-"}
             </div>
          );
        },
      },
      {
        accessorKey: "website",
        header: "Website",
        cell: ({ row, getValue }) => (
          <Input
            defaultValue={getValue() as string}
            onBlur={(e) =>
              handleCellUpdate(row.original.id, "website", e.target.value)
            }
            className="min-w-[150px]"
          />
        ),
      },
      {
        accessorKey: "telefone",
        header: "Telefone",
        cell: ({ row, getValue }) => (
          <Input
            defaultValue={getValue() as string}
            onBlur={(e) =>
              handleCellUpdate(row.original.id, "telefone", e.target.value)
            }
            className="min-w-[120px]"
          />
        ),
      },
      {
        accessorKey: "v2_score",
        header: "Score",
        cell: ({ getValue }) => (
          <div className="font-bold text-center">
            {typeof getValue() === 'number' ? (getValue() as number).toFixed(1) : '-'}
          </div>
        ),
      },
      {
        accessorKey: "enrichment_status",
        header: "Status",
        cell: ({ row, getValue }) => {
          const status = getValue() as string;
          const colors = {
            pending: "bg-yellow-100 text-yellow-800",
            in_progress: "bg-blue-100 text-blue-800",
            complete: "bg-green-100 text-green-800",
            enriched: "bg-purple-100 text-purple-800",
            failed: "bg-red-100 text-red-800",
          };
          return (
            <select
              value={status}
              onChange={(e) =>
                handleCellUpdate(row.original.id, "enrichment_status", e.target.value)
              }
              className={`px-2 py-1 rounded text-sm ${colors[status as keyof typeof colors] || "bg-gray-100"}`}
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="complete">Complete</option>
               <option value="enriched">Enriched</option>
              <option value="failed">Failed</option>
            </select>
          );
        },
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row, getValue }) => {
          const priority = getValue() as string;
          const colors = {
            low: "bg-gray-100 text-gray-800",
            medium: "bg-blue-100 text-blue-800",
            high: "bg-orange-100 text-orange-800",
            urgent: "bg-red-100 text-red-800",
          };
          return (
            <select
              value={priority}
              onChange={(e) =>
                handleCellUpdate(row.original.id, "priority", e.target.value)
              }
              className={`px-2 py-1 rounded text-sm ${colors[priority as keyof typeof colors]}`}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          );
        },
      },
      {
        accessorKey: "has_iso",
        header: "ISO",
        cell: ({ row, getValue }) => (
          <input
            type="checkbox"
            checked={getValue() as boolean}
            onChange={(e) =>
              handleCellUpdate(row.original.id, "has_iso", e.target.checked)
            }
            className="w-4 h-4"
          />
        ),
      },
      {
        accessorKey: "has_ce",
        header: "CE",
        cell: ({ row, getValue }) => (
          <input
            type="checkbox"
            checked={getValue() as boolean}
            onChange={(e) =>
              handleCellUpdate(row.original.id, "has_ce", e.target.checked)
            }
            className="w-4 h-4"
          />
        ),
      },
      {
        accessorKey: "has_fda",
        header: "FDA",
        cell: ({ row, getValue }) => (
          <input
            type="checkbox"
            checked={getValue() as boolean}
            onChange={(e) =>
              handleCellUpdate(row.original.id, "has_fda", e.target.checked)
            }
            className="w-4 h-4"
          />
        ),
      },
      {
        accessorKey: "employee_count",
        header: "Employees",
        cell: ({ row, getValue }) => (
          <Input
            type="number"
            defaultValue={getValue() as number}
            onBlur={(e) =>
              handleCellUpdate(
                row.original.id,
                "employee_count",
                parseInt(e.target.value)
              )
            }
            className="w-20"
          />
        ),
      },
      {
        accessorKey: "notes",
        header: "Notes",
        cell: ({ row, getValue }) => (
          <Input
            defaultValue={getValue() as string}
            onBlur={(e) =>
              handleCellUpdate(row.original.id, "notes", e.target.value)
            }
            className="min-w-[200px]"
          />
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: leads,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Export to CSV
  const handleExport = () => {
    const csv = Papa.unparse(leads);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: `${leads.length} leads exported to CSV`,
    });
  };

  // Import from CSV
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const response = await supabase.functions.invoke("manage-leads-csv", {
            body: { action: "import", data: { leads: results.data } },
          });

          if (response.error) throw response.error;

          toast({
            title: "Import successful",
            description: `Imported ${results.data.length} leads`,
          });

          fetchLeads();
        } catch (error: any) {
          toast({
            title: "Import failed",
            description: error.message,
            variant: "destructive",
          });
        }
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 mr-2 text-gray-400" />
          <Input
            placeholder="Search leads..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchLeads} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <label>
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </span>
            </Button>
            <input
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-gray-600">
        <span>Total: {leads.length}</span>
        <span>
          Enriched/Complete:{" "}
          {leads.filter((l) => ["complete", "enriched"].includes(l.enrichment_status)).length}
        </span>
        <span>
          Pending:{" "}
          {leads.filter((l) => l.enrichment_status === "pending").length}
        </span>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-auto h-[600px]">
        <table className="w-full relative">
          <thead className="bg-gray-50 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 bg-gray-50"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: " 🔼",
                        desc: " 🔽",
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center">
                  Loading...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center">
                  No leads found. Import a CSV to get started.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2 whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
