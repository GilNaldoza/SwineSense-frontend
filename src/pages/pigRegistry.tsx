import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPigs, type PigRecord, type GetPigsOptions } from "@/api/pigs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

export default function PigRegistry() {
  const navigate = useNavigate();
  const [pigs, setPigs] = useState<PigRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [healthFilter, setHealthFilter] = useState<string>("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchPigs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, typeFilter, healthFilter]);

  const fetchPigs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const opts: GetPigsOptions = {
        page,
        limit,
      };

      if (search) opts.query = search;
      if (typeFilter !== "all") opts.pigType = typeFilter as NonNullable<GetPigsOptions["pigType"]>;
      if (healthFilter !== "all") opts.healthStatus = healthFilter as NonNullable<GetPigsOptions["healthStatus"]>;

      const res = await getPigs(opts);
      setPigs(res.pigs);
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch pigs.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPigs();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pig Registry</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <input 
              type="text"
              placeholder="Search by Pig ID or RFID..."
              className="flex-1 px-3 py-2 border rounded-md text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Button type="submit" variant="secondary">Search</Button>
          </form>

          <Select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
            <option value="all">All Types</option>
            <option value="piglet">Piglet</option>
            <option value="gilt">Gilt</option>
            <option value="sow">Sow</option>
            <option value="boar">Boar</option>
          </Select>

          <Select value={healthFilter} onChange={e => { setHealthFilter(e.target.value); setPage(1); }}>
            <option value="all">All Health</option>
            <option value="healthy">Healthy</option>
            <option value="at-risk">At Risk</option>
            <option value="sick">Sick</option>
          </Select>
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        {/* Table */}
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-700">Pig ID</th>
                <th className="px-4 py-3 font-semibold text-gray-700">RFID</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Type</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Pen</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Health</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Added On</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : pigs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No pigs found.
                  </td>
                </tr>
              ) : (
                pigs.map(pig => (
                  <tr key={pig.id} className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => navigate(`/pig/${pig.id}`)}>
                    <td className="px-4 py-3 font-medium text-pink-600 hover:text-pink-800">{pig.pigId}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{pig.rfidTag}</td>
                    <td className="px-4 py-3 capitalize">{pig.pigType}</td>
                    <td className="px-4 py-3">{pig.pen}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        pig.healthStatus === 'healthy' ? 'bg-green-100 text-green-700' :
                        pig.healthStatus === 'at-risk' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {pig.healthStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(pig.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
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
  );
}
