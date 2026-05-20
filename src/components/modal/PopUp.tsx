import { useCreateMarkupMutation } from "@/redux/api/admin/estimateApi";
import { Check, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { CustomModal } from "./CustomModal";

export const TaxModalContent = ({ value, setValue }: any) => {
  const [taxInput, setTaxInput] = useState(String(value ?? ""));

  useEffect(() => {
    setTaxInput(String(value ?? ""));
  }, [value]);

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={taxInput}
        onChange={(e) => {
          const nextValue = e.target.value;
          setTaxInput(nextValue);
          setValue(parseFloat(nextValue) || 0);
        }}
        className="w-full px-3 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-orange-400"
        placeholder="Tax (%)"
      />
    </div>
  );
};

export const MarkupModalContent = ({ setSubmit }: any) => {
  const [form, setForm] = useState({
    name: "",
    percentage: "",
  });

  const [createMarkup] = useCreateMarkupMutation();

  const handleCreateMarkup = useCallback(async () => {
    try {
      await createMarkup({
        name: form.name,
        percentage: Number(form.percentage),
      }).unwrap();

      toast.success("Markup created successfully");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create markup");
    }
  }, [createMarkup, form.name, form.percentage]);

  useEffect(() => {
    setSubmit(() => handleCreateMarkup);
  }, [handleCreateMarkup, setSubmit]);

  return (
    <div className="space-y-4 rounded-2xl">
      <h2 className="text-xl font-semibold">Item Markup</h2>

      <div className="flex items-center border border-dashed bg-[#FBEBE0] border-orange-400 rounded-2xl p-3 cursor-pointer transition-all">
        <input
          type="text"
          value={form.name}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              name: e.target.value,
            }))
          }
          placeholder="Markup Name"
          className="w-full text-black bg-[#FBEBE0] outline-none border-none"
        />
      </div>

      <div className="flex items-center border border-dashed rounded-xl bg-[#FBEBE0] border-orange-400 p-3 cursor-pointer transition-all">
        <input
          type="number"
          value={form.percentage}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              percentage: e.target.value,
            }))
          }
          placeholder="Retail Markup (0%)"
          className="w-full bg-transparent outline-none border-none text-black"
        />
      </div>
    </div>
  );
};

export const CreateMarkupModal = ({
  open,
  onClose,
  value,
  setValue,
  onSave,
}: any) => {
  return (
    <CustomModal
      open={open}
      onClose={onClose}
      maxWidth="md"
      title="Create Markup"
      actions={[
        { label: "Cancel", variant: "secondary", onClick: onClose },
        { label: "Save", variant: "primary", onClick: onSave },
      ]}
    >
      <div className="space-y-4">
        <div>
          <label className="text-base text-gray-600 mb-1 block">
            Markup Name
          </label>
          <input
            type="text"
            placeholder="e.g. Service Charge"
            value={value.name}
            onChange={(e) =>
              setValue((prev: any) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            className="w-full border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none p-2.5 rounded-lg"
          />
        </div>

        <div>
          <label className="text-base text-gray-600 mb-1 block">
            Percentage (%)
          </label>
          <input
            type="number"
            placeholder="e.g. 15"
            value={value.percentage}
            onChange={(e) =>
              setValue((prev: any) => ({
                ...prev,
                percentage: e.target.value,
              }))
            }
            className="w-full border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none p-2.5 rounded-lg"
          />
        </div>
      </div>
    </CustomModal>
  );
};

export const MarkupPickerModal = ({
  open,
  onClose,
  markups,
  onSelect,
  onAdd,
}: any) => {
  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title="Select Markup"
      actions={[{ label: "Cancel", variant: "secondary", onClick: onClose }]}
    >
      <div className="space-y-3">
        {(markups?.length ?? 0) === 0 ? (
          <p className="text-base text-gray-500">No markups available.</p>
        ) : (
          (markups || []).map((markup: any) => (
            <button
              key={markup.id}
              type="button"
              onClick={() => onSelect(markup)}
              className="w-full p-3 border rounded-xl cursor-pointer hover:bg-orange-50 text-left"
            >
              <p className="font-semibold">{markup.name}</p>
              <p className="text-base text-gray-500">{markup.percentage}%</p>
            </button>
          ))
        )}
      </div>

      <button
        className="flex items-center gap-2 mt-3 py-4"
        onClick={onAdd}
        type="button"
      >
        <span className="font-medium">Add Markup</span>
      </button>
    </CustomModal>
  );
};

export const CreateTaxModal = ({
  open,
  onClose,
  value,
  setValue,
  onSave,
}: any) => {
  return (
    <CustomModal
      open={open}
      onClose={onClose}
      maxWidth="md"
      title="Create Tax"
      actions={[
        { label: "Cancel", variant: "secondary", onClick: onClose },
        { label: "Save", variant: "primary", onClick: onSave },
      ]}
    >
      <div className="space-y-3">
        <Input
          type="text"
          placeholder="Tax name"
          value={value.name}
          onChange={(e) =>
            setValue((prev: any) => ({ ...prev, name: e.target.value }))
          }
          className="w-full border p-2 rounded"
        />

        <Input
          type="number"
          placeholder="Enter tax %"
          value={value.percentage}
          onChange={(e) =>
            setValue((prev: any) => ({ ...prev, percentage: e.target.value }))
          }
          className="w-full border p-2 rounded"
        />
      </div>
    </CustomModal>
  );
};

export const TaxPickerModal = ({
  open,
  onClose,
  taxes,
  onSelect,
  onAdd,
}: any) => {
  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title="Select Tax"
      actions={[
        { label: "Close", variant: "secondary", onClick: onClose },
        { label: "Done", variant: "primary", onClick: onClose },
      ]}
    >
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {taxes?.length > 0 ? (
          taxes.map((tax: any) => (
            <button
              key={tax.id}
              type="button"
              onClick={() => onSelect(tax)}
              className="w-full p-3 border rounded-lg cursor-pointer hover:bg-orange-50 text-left"
            >
              <p className="font-semibold">{tax.name}</p>
              <p className="text-base text-gray-500">{tax.percentage}%</p>
            </button>
          ))
        ) : (
          <p className="text-base text-gray-400 text-center">No tax found</p>
        )}
      </div>

      <button
        className="flex items-center gap-2 mt-3 py-4"
        onClick={onAdd}
        type="button"
      >
        <span className="font-medium text-lg"> Add Tax</span>
      </button>
    </CustomModal>
  );
};

export const DiscountModalContent = ({ value, setValue }: any) => {
  const initialUnit = value?.unit ?? "percent";
  const initialValue = value?.value ?? "";
  const [unit, setUnit] = useState<"percent" | "dollar">(initialUnit);
  const [inputValue, setInputValue] = useState(String(initialValue ?? ""));
  const lastSyncedSignature = useRef(
    `${String(initialValue ?? "")}|${initialUnit}`,
  );

  useEffect(() => {
    const newVal = String(value?.value ?? "");
    const newUnit = value?.unit ?? "percent";
    const nextSignature = `${newVal}|${newUnit}`;

    if (nextSignature === lastSyncedSignature.current) return;

    if (newVal !== inputValue) setInputValue(newVal);
    if (newUnit !== unit) setUnit(newUnit);
    lastSyncedSignature.current = nextSignature;
  }, [value, inputValue, unit]);

  useEffect(() => {
    const num = parseFloat(inputValue) || 0;
    try {
      const currentVal = value?.value ?? 0;
      const currentUnit = value?.unit ?? "percent";
      const nextSignature = `${String(num)}|${unit}`;
      const currentSignature = `${String(currentVal)}|${currentUnit}`;

      if (currentSignature !== nextSignature) {
        lastSyncedSignature.current = nextSignature;
        setValue({ value: num, unit });
      }
    } catch (e) {
      lastSyncedSignature.current = `${String(num)}|${unit}`;
      setValue({ value: num, unit });
    }
  }, [inputValue, unit, setValue, value]);

  return (
    <div className="space-y-4">
      <p>Discount gets added to your document total.</p>

      <div className="flex items-center gap-3 mt-3">
        <button
          type="button"
          onClick={() => setUnit("percent")}
          className="flex items-center px-4 py-3 border rounded-lg transition-all"
        >
          <div
            className={`w-4 h-4 mr-2 flex items-center justify-center border rounded-sm ${
              unit === "percent"
                ? "bg-primary border-primary"
                : "border-gray-400"
            }`}
          >
            {unit === "percent" && <Check className="w-3 h-3 text-white" />}
          </div>
          (%)
        </button>

        <button
          type="button"
          onClick={() => setUnit("dollar")}
          className="flex items-center px-4 py-3 border rounded-lg transition-all"
        >
          <div
            className={`w-4 h-4 mr-2 flex items-center justify-center border rounded-sm ${
              unit === "dollar"
                ? "bg-primary border-primary"
                : "border-gray-400"
            }`}
          >
            {unit === "dollar" && <Check className="w-3 h-3 text-white" />}
          </div>
          ($)
        </button>
      </div>

      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="w-full px-3 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-orange-400"
        placeholder={unit === "percent" ? "Discount (%)" : "Discount ($)"}
      />
    </div>
  );
};

export const DepositModalContent = ({ value, setValue }: any) => {
  const initialUnit = value?.unit ?? "percent";
  const initialValue = value?.value ?? "";
  const [unit, setUnit] = useState<"percent" | "dollar">(initialUnit);
  const [depositInput, setDepositInput] = useState(String(initialValue ?? ""));
  const lastSyncedSignature = useRef(
    `${String(initialValue ?? "")}|${initialUnit}`,
  );

  useEffect(() => {
    const newVal = String(value?.value ?? "");
    const newUnit = value?.unit ?? "percent";
    const nextSignature = `${newVal}|${newUnit}`;

    if (nextSignature === lastSyncedSignature.current) return;

    if (newVal !== depositInput) setDepositInput(newVal);
    if (newUnit !== unit) setUnit(newUnit);
    lastSyncedSignature.current = nextSignature;
  }, [value, depositInput, unit]);

  useEffect(() => {
    const num = parseFloat(depositInput) || 0;
    try {
      const currentVal = value?.value ?? 0;
      const currentUnit = value?.unit ?? "percent";
      const nextSignature = `${String(num)}|${unit}`;
      const currentSignature = `${String(currentVal)}|${currentUnit}`;

      if (currentSignature !== nextSignature) {
        lastSyncedSignature.current = nextSignature;
        setValue({ value: num, unit });
      }
    } catch (e) {
      lastSyncedSignature.current = `${String(num)}|${unit}`;
      setValue({ value: num, unit });
    }
  }, [depositInput, unit, setValue, value]);

  return (
    <div className="space-y-4">
      <p>Get some peace of mind and get a deposit before the work starts.</p>

      <div className="flex items-center gap-3 mt-3">
        <button
          type="button"
          onClick={() => setUnit("percent")}
          className="flex items-center px-4 py-3 border rounded-lg transition-all"
        >
          <div
            className={`w-4 h-4 mr-2 flex items-center justify-center border rounded-sm ${
              unit === "percent"
                ? "bg-primary border-primary"
                : "border-gray-400"
            }`}
          >
            {unit === "percent" && <Check className="w-3 h-3 text-white" />}
          </div>
          (%)
        </button>

        <button
          type="button"
          onClick={() => setUnit("dollar")}
          className="flex items-center px-4 py-3 border rounded-lg transition-all"
        >
          <div
            className={`w-4 h-4 mr-2 flex items-center justify-center border rounded-sm ${
              unit === "dollar"
                ? "bg-primary border-primary"
                : "border-gray-400"
            }`}
          >
            {unit === "dollar" && <Check className="w-3 h-3 text-white" />}
          </div>
          ($)
        </button>
      </div>

      <input
        type="text"
        value={depositInput}
        onChange={(e) => setDepositInput(e.target.value)}
        className="w-full px-3 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-orange-400"
        placeholder={unit === "percent" ? "Deposit (%)" : "Deposit ($)"}
      />
    </div>
  );
};

export const MarkupSummaryModal = ({
  open,
  onClose,
  markups,
  onSelect,
  onAdd,
  loading,
}: any) => {
  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title="Select Markup"
      actions={[{ label: "Cancel", variant: "secondary", onClick: onClose }]}
    >
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
          </div>
        ) : (markups?.length ?? 0) === 0 ? (
          <p className="text-base text-gray-500">No markups available.</p>
        ) : (
          (markups || []).map((markup: any) => (
            <button
              key={markup.id}
              type="button"
              onClick={() => onSelect(markup)}
              className="w-full p-3 border rounded-xl cursor-pointer hover:bg-orange-50 text-left"
            >
              <p className="font-semibold">{markup.name}</p>
              <p className="text-base text-gray-500">{markup.percentage}%</p>
            </button>
          ))
        )}
      </div>

      <div className="mt-8">
        <Button
          type="button"
          onClick={() => {
            if (onAdd) onAdd();
          }}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
        >
          <Plus size={25} /> Add Markup
        </Button>
      </div>
    </CustomModal>
  );
};

export const TaxSummaryModal = ({
  open,
  onClose,
  taxes,
  onSelect,
  onAdd,
  loading,
}: any) => {
  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title="Select Tax"
      actions={[{ label: "Cancel", variant: "secondary", onClick: onClose }]}
    >
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
          </div>
        ) : (taxes?.length ?? 0) === 0 ? (
          <p className="text-base text-gray-500">No taxes available.</p>
        ) : (
          (taxes || []).map((tax: any) => (
            <button
              key={tax.id}
              type="button"
              onClick={() => onSelect(tax)}
              className="w-full p-3 border rounded-xl cursor-pointer hover:bg-orange-50 text-left"
            >
              <p className="font-semibold">{tax.name}</p>
              <p className="text-base text-gray-500">{tax.percentage}%</p>
            </button>
          ))
        )}
      </div>

      <div className="mt-8">
        <Button
          type="button"
          onClick={() => {
            if (onAdd) onAdd();
          }}
          className="mt-4 px-4 py-2 bg-primary text-white  rounded-lg hover:bg-primary/90 transition-all"
        >
          <Plus size={20} />
          Add Tax
        </Button>
      </div>
    </CustomModal>
  );
};

export const DiscountSummaryModal = ({
  open,
  onClose,
  value,
  setValue,
}: any) => {
  return (
    <CustomModal
      open={open}
      onClose={onClose}
      maxWidth="md"
      actions={[
        { label: "Cancel", variant: "secondary", onClick: onClose },
        { label: "Apply", variant: "primary", onClick: onClose },
      ]}
    >
      <DiscountModalContent value={value} setValue={setValue} />
    </CustomModal>
  );
};

export const DepositSummaryModal = ({
  open,
  onClose,
  value,
  setValue,
}: any) => {
  return (
    <CustomModal
      open={open}
      onClose={onClose}
      maxWidth="md"
      title="Deposit"
      actions={[
        { label: "Cancel", variant: "secondary", onClick: onClose },
        { label: "Apply", variant: "primary", onClick: onClose },
      ]}
    >
      <DepositModalContent value={value} setValue={setValue} />
    </CustomModal>
  );
};
