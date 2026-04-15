import { useCreateMarkupMutation } from "@/redux/api/admin/estimateApi";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// MARKUP MODAL
export const MarkupModalContent = ({ setSubmit }: any) => {
  const [form, setForm] = useState({
    name: "",
    percentage: 0,
  });

  const [createMarkup, { isLoading }] = useCreateMarkupMutation();

  const handleCreateMarkup = async () => {
    try {
      const body = {
        name: form.name,
        percentage: form.percentage,
      };

      await createMarkup(body).unwrap();

      toast.success("Markup created successfully");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create markup");
    }
  };

  useEffect(() => {
    setSubmit(() => handleCreateMarkup);
  }, [form]);

  return (
    <div className="space-y-4 rounded-2xl">
      <h2 className="text-xl font-semibold">Item Markup</h2>

      {/* NAME INPUT (same design) */}
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
              percentage: Number(e.target.value),
            }))
          }
          placeholder="Retail Markup (0%)"
          className="w-full bg-transparent outline-none border-none text-black"
        />
      </div>
    </div>
  );
};

// DISCOUNT MODAL
export const DiscountModalContent = ({ value, setValue }: any) => {
  const [unit, setUnit] = useState<"percent" | "dollar">("percent");

  return (
    <div className="space-y-4">
      <h2 className="text-lg md:text-2xl font-semibold ">Discount</h2>
      <p>Discount gets added to your document total.</p>

      <div className="flex items-center gap-3 mt-3">
        <button
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
        value={""}
        onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
        className="w-full px-3 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-orange-400"
        placeholder={"Discount (%)"}
      />
    </div>
  );
};

// DEPOSIT MODAL

export const DepositModalContent = ({ value, setValue }: any) => {
  const [unit, setUnit] = useState<"percent" | "dollar">("percent");

  return (
    <div className="space-y-4">
      <h2 className="text-lg md:text-2xl font-semibold">Deposit</h2>
      <p>Get some peace of mind and get a deposit before the work starts.</p>

      {/* Unit Selector */}
      <div className="flex items-center gap-3 mt-3">
        <button
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

      {/* Input */}
      <input
        type="text"
        value={""}
        onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
        className="w-full px-3 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-orange-400"
        placeholder={unit === "percent" ? "Deposit (%)" : "Deposit ($)"}
      />
    </div>
  );
};
