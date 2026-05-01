import { useState, type ChangeEvent, type FormEvent, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PigFormValues = {
  rfidTag?: string;
  pigId?: string;
  pigType?: "piglet" | "sow" | "boar" | "gilt";
  sire?: string;
  dam?: string;
  pen?: string;
  healthStatus?: "healthy" | "at-risk" | "sick";
  weight?: number;
  dateOfBirth?: string;
  notes?: string;
};

type PigFormProps = {
  initialValues?: PigFormValues;
  submitText?: string;
  onSubmit?: (values: PigFormValues) => Promise<void>;
  disabled?: boolean;
  className?: string;
  isLoading?: boolean;
};

const pigTypes = ["piglet", "sow", "boar", "gilt"];
const healthStatuses = ["healthy", "at-risk", "sick"];

const defaultValues: PigFormValues = {
  rfidTag: "",
  pigId: "",
  pigType: "piglet",
  sire: "",
  dam: "",
  pen: "",
  healthStatus: "healthy",
  weight: undefined,
  dateOfBirth: "",
  notes: "",
};

export default function PigForm({
  initialValues = {},
  submitText = "Register",
  onSubmit,
  disabled,
  className,
  isLoading = false,
}: PigFormProps) {
  const [values, setValues] = useState<PigFormValues>({
    ...defaultValues,
    ...initialValues,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setValues((prev) => ({ ...defaultValues, ...prev, ...initialValues }));
    }
  }, [initialValues]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!values.rfidTag?.trim()) newErrors.rfidTag = "RFID Tag is required";
    if (!values.pigId?.trim()) newErrors.pigId = "Pig ID is required";
    if (!values.pigType) newErrors.pigType = "Pig Type is required";
    if (!values.pen?.trim()) newErrors.pen = "Pen/Building is required";
    if (!values.dateOfBirth)
      newErrors.dateOfBirth = "Date of Birth is required";
    if (values.weight !== undefined && values.weight <= 0) {
      newErrors.weight = "Weight must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]:
        name === "weight" ? (value ? parseFloat(value) : undefined) : value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLocalLoading(true);
      if (onSubmit) {
        await onSubmit(values);
      }
    } finally {
      setLocalLoading(false);
    }
  };

  const isFormDisabled = disabled || localLoading || isLoading;

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      {/* RFID Tag - Read-only or auto-filled */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          RFID Tag <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          name="rfidTag"
          value={values.rfidTag || ""}
          onChange={handleChange}
          disabled={isFormDisabled || initialValues?.rfidTag ? true : false}
          placeholder="e.g., TAG-001234"
          className={errors.rfidTag ? "border-red-500" : ""}
        />
        {errors.rfidTag && (
          <p className="text-xs text-red-500 mt-1">{errors.rfidTag}</p>
        )}
      </div>

      {/* Pig ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Pig ID <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          name="pigId"
          value={values.pigId || ""}
          onChange={handleChange}
          disabled={isFormDisabled}
          placeholder="e.g., PIG-2024-001"
          className={errors.pigId ? "border-red-500" : ""}
        />
        {errors.pigId && (
          <p className="text-xs text-red-500 mt-1">{errors.pigId}</p>
        )}
      </div>

      {/* Pig Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Pig Type <span className="text-red-500">*</span>
        </label>
        <Select
          name="pigType"
          value={values.pigType || ""}
          onChange={handleChange}
          disabled={isFormDisabled}
          className={errors.pigType ? "border-red-500" : ""}
        >
          <option value="">Select Pig Type</option>
          {pigTypes.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </Select>
        {errors.pigType && (
          <p className="text-xs text-red-500 mt-1">{errors.pigType}</p>
        )}
      </div>

      {/* Sire & Dam Row */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sire
          </label>
          <Input
            type="text"
            name="sire"
            value={values.sire || ""}
            onChange={handleChange}
            disabled={isFormDisabled}
            placeholder="Sire ID"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Dam</label>
          <Input
            type="text"
            name="dam"
            value={values.dam || ""}
            onChange={handleChange}
            disabled={isFormDisabled}
            placeholder="Dam ID"
          />
        </div>
      </div>

      {/* Pen/Building Assignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Pen/Building <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          name="pen"
          value={values.pen || ""}
          onChange={handleChange}
          disabled={isFormDisabled}
          placeholder="e.g., Pen A1"
          className={errors.pen ? "border-red-500" : ""}
        />
        {errors.pen && (
          <p className="text-xs text-red-500 mt-1">{errors.pen}</p>
        )}
      </div>

      {/* Health Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Health Status
        </label>
        <Select
          name="healthStatus"
          value={values.healthStatus || ""}
          onChange={handleChange}
          disabled={isFormDisabled}
        >
          {healthStatuses.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </Select>
      </div>

      {/* Weight & Date of Birth Row */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Weight (kg) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            name="weight"
            value={values.weight || ""}
            onChange={handleChange}
            disabled={isFormDisabled}
            placeholder="0.0"
            step="0.1"
            className={errors.weight ? "border-red-500" : ""}
          />
          {errors.weight && (
            <p className="text-xs text-red-500 mt-1">{errors.weight}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            name="dateOfBirth"
            value={values.dateOfBirth || ""}
            onChange={handleChange}
            disabled={isFormDisabled}
            className={errors.dateOfBirth ? "border-red-500" : ""}
          />
          {errors.dateOfBirth && (
            <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth}</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          name="notes"
          value={values.notes || ""}
          onChange={handleChange}
          disabled={isFormDisabled}
          placeholder="Any additional notes..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isFormDisabled} className="w-full">
        {localLoading || isLoading ? "Saving..." : submitText}
      </Button>
    </form>
  );
}
