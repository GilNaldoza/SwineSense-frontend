import { useState } from "react";
import RFIDScanner, { type PigRecord } from "@/components/form/rfidScanner";
import PigDashboard from "./pigDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export default function PigManagementPage() {
  const [lastScannedPig, setLastScannedPig] = useState<PigRecord | null>(null);
  const [recentActions, setRecentActions] = useState<
    Array<{
      id: string;
      action: "scan" | "create" | "update";
      pigId: string;
      timestamp: string;
    }>
  >([]);

  const handleScanSuccess = (pig: PigRecord) => {
    setLastScannedPig(pig);
    setRecentActions((prev) => [
      {
        id: `${Date.now()}`,
        action: "scan",
        pigId: pig.pigId,
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev.slice(0, 4),
    ]);
  };

  const handleNewPigCreated = (pig: PigRecord) => {
    setLastScannedPig(pig);
    setRecentActions((prev) => [
      {
        id: `${Date.now()}`,
        action: lastScannedPig ? "update" : "create",
        pigId: pig.pigId,
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev.slice(0, 4),
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Pig Management</h2>
          <p className="text-gray-500 mt-1">
            Manage and scan pigs in your farm
          </p>
        </div>
        <Button className="bg-linear-to-r from-pink-500 to-pink-600 text-white hover:shadow-lg">
          Add New Pig
        </Button>
      </div>

      {/* RFID Scanner Active Indicator */}
      <RFIDScanner
        onScanSuccess={handleScanSuccess}
        onNewPigCreated={handleNewPigCreated}
        enabled={true}
      />

      {/* Last Scanned Pig Card */}
      {lastScannedPig && (
        <Card className="border-pink-200 bg-linear-to-r from-pink-50 to-pink-100">
          <CardHeader>
            <CardTitle className="text-base">Last Scanned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-600">Pig ID</p>
                <p className="font-semibold text-gray-900 mt-1">
                  {lastScannedPig.pigId}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Type</p>
                <p className="font-semibold text-gray-900 mt-1">
                  {lastScannedPig.pigType}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Pen</p>
                <p className="font-semibold text-gray-900 mt-1">
                  {lastScannedPig.pen}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Status</p>
                <p
                  className={`font-semibold mt-1 ${
                    lastScannedPig.healthStatus === "healthy"
                      ? "text-green-600"
                      : lastScannedPig.healthStatus === "at-risk"
                        ? "text-amber-600"
                        : "text-red-600"
                  }`}
                >
                  {lastScannedPig.healthStatus}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Actions Log */}
      {recentActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-center justify-between text-sm p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        action.action === "scan"
                          ? "bg-blue-100 text-blue-700"
                          : action.action === "create"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {action.action.toUpperCase()}
                    </span>
                    <span className="font-medium text-gray-900">
                      {action.pigId}
                    </span>
                  </div>
                  <span className="text-gray-500 text-xs">
                    {action.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="dashboard">Dashboard Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <PigDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
