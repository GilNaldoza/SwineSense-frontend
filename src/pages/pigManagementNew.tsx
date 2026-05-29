import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Download, Upload, ChevronLeft, ChevronRight, Activity, ArrowRightLeft, Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getPigs, exportPigsToCSV, batchUpdateHealth, batchTransfer, importPigs,
  type PigsResponse, type GetPigsOptions
} from "@/api/pigs";

export default function PigManagementPage() {
  const navigate = useNavigate();
  const [pigsData, setPigsData] = useState<PigsResponse>({ pigs: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<GetPigsOptions['pigType'] | ''>("");
  const [healthFilter, setHealthFilter] = useState<GetPigsOptions['healthStatus'] | ''>("");
  const [penFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Selection & Bulk
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showBulkHealth, setShowBulkHealth] = useState(false);
  const [showBulkTransfer, setShowBulkTransfer] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [bulkHealthStatus, setBulkHealthStatus] = useState("healthy");
  const [bulkHealthReason, setBulkHealthReason] = useState("");
  const [bulkPen, setBulkPen] = useState("");
  const [importText, setImportText] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; errors: string[] } | null>(null);

  const fetchPigs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPigs({
        query: search || undefined,
        pigType: typeFilter || undefined,
        healthStatus: healthFilter || undefined,
        pen: penFilter || undefined,
        page,
        limit,
      });
      setPigsData(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load pigs");
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, healthFilter, penFilter, page]);

  useEffect(() => {
    fetchPigs();
  }, [fetchPigs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPigs();
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await exportPigsToCSV({ query: search, pigType: typeFilter || undefined, healthStatus: healthFilter || undefined, pen: penFilter || undefined });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pigs_export_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === pigsData.pigs.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pigsData.pigs.map(p => p.id)));
    }
  };

  const handleBulkHealth = async () => {
    try {
      setBulkLoading(true);
      await batchUpdateHealth(Array.from(selected), bulkHealthStatus, bulkHealthReason || undefined);
      setShowBulkHealth(false);
      setSelected(new Set());
      fetchPigs();
    } catch (err) {
      console.error(err);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkTransfer = async () => {
    if (!bulkPen) return;
    try {
      setBulkLoading(true);
      await batchTransfer(Array.from(selected), bulkPen);
      setShowBulkTransfer(false);
      setSelected(new Set());
      setBulkPen("");
      fetchPigs();
    } catch (err) {
      console.error(err);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      setBulkLoading(true);
      setImportResult(null);
      // Parse CSV text
      const lines = importText.trim().split("\n");
      if (lines.length < 2) {
        setImportResult({ created: 0, errors: ["CSV must have at least a header row and one data row"] });
        return;
      }
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/[^a-z]/g, ''));
      const rows = lines.slice(1).map(line => {
        const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ''));
        const row: Record<string, string> = {};
        headers.forEach((h, i) => {
          // Map common header names
          const key = h === "pignumber" ? "pigNumber" : h === "rfidtag" ? "rfidTag" : h === "pigtype" ? "pigType" :
            h === "dateofbirth" ? "dateOfBirth" : h === "healthstatus" ? "healthStatus" : h;
          row[key] = values[i] || "";
        });
        return row;
      }).filter(r => r.pigNumber || r.rfidTag);

      const result = await importPigs(rows);
      setImportResult(result);
      if (result.created > 0) fetchPigs();
    } catch (err) {
      console.error(err);
      setImportResult({ created: 0, errors: ["Import failed"] });
    } finally {
      setBulkLoading(false);
    }
  };

  const totalPages = pigsData.pagination?.totalPages || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Pig Management</h2>
          <p className="text-gray-500 mt-1">Manage, search, and batch-operate on your pig records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setShowImport(true)}>
            <Upload className="w-4 h-4" /> Import CSV
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleExport} disabled={exporting}>
            <Download className="w-4 h-4" /> {exporting ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selected.size > 0 && (
        <Card className="border-pink-200 bg-pink-50">
          <CardContent className="p-4 flex items-center justify-between">
            <span className="font-semibold text-pink-800">{selected.size} pig{selected.size > 1 ? 's' : ''} selected</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-2 border-pink-300" onClick={() => setShowBulkHealth(true)}>
                <Activity className="w-4 h-4" /> Update Health
              </Button>
              <Button size="sm" variant="outline" className="gap-2 border-pink-300" onClick={() => setShowBulkTransfer(true)}>
                <ArrowRightLeft className="w-4 h-4" /> Transfer Pen
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input className="pl-10" placeholder="Search by pig number, RFID, pen..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Button type="submit" variant="secondary">Search</Button>
            </form>
            <div className="flex gap-2">
              <select className="px-3 py-2 border rounded-md text-sm" value={typeFilter} onChange={e => { setTypeFilter(e.target.value as GetPigsOptions['pigType'] | ''); setPage(1) }}>
                <option value="">All Types</option>
                <option value="piglet">Piglet</option>
                <option value="gilt">Gilt</option>
                <option value="sow">Sow</option>
                <option value="boar">Boar</option>
              </select>
              <select className="px-3 py-2 border rounded-md text-sm" value={healthFilter} onChange={e => { setHealthFilter(e.target.value as GetPigsOptions['healthStatus'] | ''); setPage(1) }}>
                <option value="">All Health</option>
                <option value="healthy">Healthy</option>
                <option value="at-risk">At Risk</option>
                <option value="sick">Sick</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pig Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pig Records {pigsData.pagination && <span className="text-sm font-normal text-gray-500">({pigsData.pagination.total} total)</span>}</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={selected.size === pigsData.pigs.length && pigsData.pigs.length > 0} onChange={toggleSelectAll} className="rounded" />
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Pig Number</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">RFID Tag</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Type</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Pen</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Health</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Weight</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">DOB</th>
                  <th className="px-4 py-3 font-semibold text-gray-700"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
                ) : pigsData.pigs.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">No pigs found. {search && "Try a different search."}</td></tr>
                ) : (
                  pigsData.pigs.map(pig => (
                    <tr key={pig.id} className={`hover:bg-gray-50 ${selected.has(pig.id) ? "bg-pink-50" : ""}`}>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.has(pig.id)} onChange={() => toggleSelect(pig.id)} className="rounded" />
                      </td>
                      <td className="px-4 py-3 font-semibold text-pink-600 cursor-pointer hover:underline" onClick={() => navigate(`/pig/${pig.id}`)}>
                        {pig.pigId}
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{pig.rfidTag}</td>
                      <td className="px-4 py-3 capitalize text-gray-700">{pig.pigType}</td>
                      <td className="px-4 py-3 text-gray-700">{pig.pen}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          pig.healthStatus === "healthy" ? "bg-green-100 text-green-700" :
                          pig.healthStatus === "at-risk" ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {pig.healthStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{pig.weight ? `${pig.weight} kg` : "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{pig.dateOfBirth ? new Date(pig.dateOfBirth).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => navigate(`/pig/${pig.id}`)} className="text-pink-500 hover:text-pink-700" title="View Profile">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Health Modal */}
      {showBulkHealth && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Bulk Health Update ({selected.size} pigs)</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Health Status</label>
                <select className="w-full px-3 py-2 border rounded-lg text-sm" value={bulkHealthStatus} onChange={e => setBulkHealthStatus(e.target.value)}>
                  <option value="healthy">Healthy</option>
                  <option value="at-risk">At Risk</option>
                  <option value="sick">Sick</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                <textarea className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} value={bulkHealthReason} onChange={e => setBulkHealthReason(e.target.value)} placeholder="e.g. Post-vaccination monitoring" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button className="flex-1 bg-pink-500 text-white" onClick={handleBulkHealth} disabled={bulkLoading}>{bulkLoading ? "Updating..." : "Update"}</Button>
                <Button variant="outline" className="flex-1" onClick={() => setShowBulkHealth(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Transfer Modal */}
      {showBulkTransfer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Pen Transfer ({selected.size} pigs)</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Pen *</label>
                <Input value={bulkPen} onChange={e => setBulkPen(e.target.value)} placeholder="e.g. A3" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button className="flex-1 bg-pink-500 text-white" onClick={handleBulkTransfer} disabled={bulkLoading || !bulkPen}>{bulkLoading ? "Transferring..." : "Transfer"}</Button>
                <Button variant="outline" className="flex-1" onClick={() => setShowBulkTransfer(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Import Pigs from CSV</h3>
            <p className="text-sm text-gray-500 mb-4">
              Paste CSV data below. Required columns: <code className="text-pink-600">pigNumber, rfidTag, pigType, pen, dateOfBirth</code>. Optional: sire, dam, weight, healthStatus, notes.
            </p>
            <div className="space-y-3">
              <textarea className="w-full px-3 py-2 border rounded-lg text-xs font-mono" rows={8} value={importText} onChange={e => setImportText(e.target.value)} placeholder={`pigNumber,rfidTag,pigType,pen,dateOfBirth,weight\nPIG-100,RFID001,piglet,A1,2025-01-15,12.5\nPIG-101,RFID002,gilt,A2,2025-02-20,35.0`} />

              {importResult && (
                <div className={`p-3 rounded-lg text-sm ${importResult.errors.length > 0 ? "bg-amber-50 border border-amber-200" : "bg-green-50 border border-green-200"}`}>
                  <p className="font-semibold">{importResult.created} pig(s) imported successfully</p>
                  {importResult.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold text-amber-700">{importResult.errors.length} error(s):</p>
                      <ul className="list-disc list-inside text-xs mt-1">
                        {importResult.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                        {importResult.errors.length > 5 && <li>...and {importResult.errors.length - 5} more</li>}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button className="flex-1 bg-pink-500 text-white" onClick={handleImport} disabled={bulkLoading || !importText.trim()}>
                  {bulkLoading ? "Importing..." : "Import"}
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => { setShowImport(false); setImportResult(null); setImportText("") }}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
