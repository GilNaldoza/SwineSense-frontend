import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import PigForm, { type PigFormValues } from "@/components/form/pigForm";
import { checkPigByRfid, createPigRecord, updatePigRecord } from "@/api/pigs";

export type PigRecord = {
  id: string;
  rfidTag: string;
  pigId: string;
  pigType: "piglet" | "sow" | "boar" | "gilt";
  sire?: string;
  dam?: string;
  pen: string;
  healthStatus: "healthy" | "at-risk" | "sick";
  weight?: number;
  dateOfBirth: string;
  notes?: string;
  lastScanned: string;
  createdAt: string;
  updatedAt: string;
};

type RFIDScannerProps = {
  onScanSuccess?: (pig: PigRecord) => void;
  onNewPigCreated?: (pig: PigRecord) => void;
  enabled?: boolean;
};

export default function RFIDScanner({
  onScanSuccess,
  onNewPigCreated,
  enabled = true,
}: RFIDScannerProps) {
  const [scanBuffer, setScanBuffer] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [existingPig, setExistingPig] = useState<PigRecord | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  // Listen for RFID scan input (assumes RFID reader simulates keyboard input ending with Enter)
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = async (e: KeyboardEvent) => {
      // Don't interfere with form inputs or modifier keys
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey
      ) {
        return;
      }

      // Accumulate scan data
      if (e.key === "Enter" && scanBuffer.trim()) {
        e.preventDefault();
        const rfidTag = scanBuffer.trim();
        setScanBuffer("");

        try {
          setIsChecking(true);
          setError(null);

          // Check if pig exists
          const pig = await checkPigByRfid(rfidTag);

          if (pig) {
            // Existing pig - show their record
            setExistingPig(pig);
            onScanSuccess?.(pig);
          } else {
            // New pig - show registration form with pre-filled RFID
            setExistingPig(null);
          }

          setIsModalOpen(true);
        } catch (err: unknown) {
          setError(
            err instanceof Error ? err.message : "Failed to check pig record",
          );
          console.error("RFID scan error:", err);
        } finally {
          setIsChecking(false);
        }
      } else if (
        e.key !== "Enter" &&
        e.key !== "Shift" &&
        e.key !== "Control" &&
        e.key !== "Meta" &&
        e.key !== "Alt"
      ) {
        // Add character to scan buffer
        setScanBuffer((prev) => prev + e.key);

        // Clear timeout and reset if no new input for 5 seconds
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setScanBuffer("");
        }, 5000);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [scanBuffer, enabled, onScanSuccess]);

  const handlePigFormSubmit = async (values: PigFormValues) => {
    try {
      setIsSaving(true);
      setError(null);

      const pigData = {
        rfidTag: values.rfidTag || scanBuffer,
        pigId: values.pigId || "",
        pigType: values.pigType || "piglet",
        sire: values.sire,
        dam: values.dam,
        pen: values.pen || "",
        healthStatus: values.healthStatus || "healthy",
        weight: values.weight,
        dateOfBirth: values.dateOfBirth || "",
        notes: values.notes,
      };

      const result = existingPig
        ? await updatePigRecord(existingPig.id, pigData)
        : await createPigRecord(pigData);

      onNewPigCreated?.(result);
      setIsModalOpen(false);
      setExistingPig(null);
      setScanBuffer("");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to save pig record",
      );
      console.error("Form submission error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setExistingPig(null);
    setScanBuffer("");
    setError(null);
  };

  return (
    <>
      {/* Scan Status Card (optional, for feedback) */}
      {enabled && (
        <Card className="mb-4 border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              RFID Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-600">
            {isChecking ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                Checking RFID tag...
              </div>
            ) : scanBuffer ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                Scanning: {scanBuffer}
              </div>
            ) : (
              <div>Ready to scan RFID tags</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* RFID Registration Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {existingPig ? "Pig Record" : "Register New Pig"}
            </DialogTitle>
            <DialogDescription>
              {existingPig
                ? `Update record for pig ${existingPig.pigId}`
                : "Enter pig information to create a new record"}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              {error}
            </div>
          )}

          {existingPig ? (
            // Display existing pig info with update option
            <div className="space-y-3 py-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Pig ID</p>
                  <p className="font-semibold">{existingPig.pigId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">RFID Tag</p>
                  <p className="font-semibold">{existingPig.rfidTag}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="font-semibold">{existingPig.pigType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pen</p>
                  <p className="font-semibold">{existingPig.pen}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Health Status</p>
                  <p
                    className={`font-semibold ${
                      existingPig.healthStatus === "healthy"
                        ? "text-green-600"
                        : existingPig.healthStatus === "at-risk"
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {existingPig.healthStatus}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Weight</p>
                  <p className="font-semibold">
                    {existingPig.weight || "N/A"} kg
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Scanned</p>
                  <p className="font-semibold text-xs">
                    {new Date(existingPig.lastScanned).toLocaleString()}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setExistingPig(null)}
                variant="outline"
                className="w-full"
              >
                Edit Record
              </Button>
            </div>
          ) : (
            // Show registration form for new pig
            <PigForm
              initialValues={{ rfidTag: scanBuffer }}
              submitText="Register Pig"
              onSubmit={handlePigFormSubmit}
              isLoading={isSaving}
            />
          )}

          <div className="flex gap-2 justify-end mt-4">
            <Button
              variant="outline"
              onClick={handleCloseModal}
              disabled={isSaving}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
