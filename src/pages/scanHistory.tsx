import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download } from 'lucide-react';
import { getPigScans, exportPigScansToCSV, type PigScanLog } from "@/api/pigs";

// We need to map the pig fields correctly from the PigScanLog backend response
type HydratedScanLog = PigScanLog & { 
  pig?: { 
    pigNumber: string; 
    pigType: string; 
    pen: string; 
    rfidTag: string; 
  };
  admin?: {
    fullName: string;
  };
};

export default function ScanHistoryPage() {
  const [scans, setScans] = useState<HydratedScanLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 15;

  useEffect(() => {
    fetchScans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchScans = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPigScans({
        page,
        limit,
        query: search,
        pen: location, // maps to location in the backend query
      });
      setScans(res.scans as HydratedScanLog[]);
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages);
        setTotalCount(res.pagination.total);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch scan history.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchScans();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Scan History</h2>
          <p className="text-gray-500 mt-1">View offline and real-time pig scanning logs</p>
        </div>
        <Button
          className="bg-linear-to-r from-pink-500 to-pink-600 text-white hover:shadow-lg gap-2"
          onClick={async () => {
            try {
              const blob = await exportPigScansToCSV();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `scan-history-${new Date().toISOString().split('T')[0]}.csv`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
            } catch (err) {
              console.error("Export failed:", err);
            }
          }}
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by Pig Number or RFID..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Input
              placeholder="Filter by Location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <div className="flex gap-2">
              <Button type="submit" variant="secondary" className="flex-1">Filter</Button>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setSearch("");
                  setLocation("");
                  setPage(1);
                  setTimeout(fetchScans, 0);
                }}
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-3 px-4 font-semibold text-gray-900">Pig Number</th>
                  <th className="py-3 px-4 font-semibold text-gray-900">RFID Tag</th>
                  <th className="py-3 px-4 font-semibold text-gray-900">Type</th>
                  <th className="py-3 px-4 font-semibold text-gray-900">Scan Location</th>
                  <th className="py-3 px-4 font-semibold text-gray-900">Time</th>
                  <th className="py-3 px-4 font-semibold text-gray-900">Scanned By</th>
                  <th className="py-3 px-4 font-semibold text-gray-900">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">Loading scans...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-red-500">{error}</td>
                  </tr>
                ) : scans.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">No scan logs found.</td>
                  </tr>
                ) : (
                  scans.map((scan) => (
                    <tr key={scan.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {scan.pig?.pigNumber || '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-600">
                        {scan.pig?.rfidTag || scan.rfidTag}
                      </td>
                      <td className="py-3 px-4 text-gray-700 capitalize">
                        {scan.pig?.pigType || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {scan.location || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                        {new Date(scan.scanTimestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {scan.admin?.fullName || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-500 max-w-[200px] truncate" title={scan.notes}>
                        {scan.notes || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && scans.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing page {page} of {totalPages} ({totalCount} total scans)
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
