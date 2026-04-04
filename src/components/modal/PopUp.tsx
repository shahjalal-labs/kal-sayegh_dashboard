import { Check } from "lucide-react";
import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { CustomModal } from "./CustomModal";

// MARKUP MODAL
export const MarkupModalContent = ({ value, setValue }: any) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [values, setValues] = useState<{ [key: number]: string }>({
    1: "",
    2: "",
  });
  const [unit, setUnit] = useState<"percent" | "dollar">("percent");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newValue, setNewValue] = useState("");

  const handleChange = (index: number, val: string) => {
    setValues({ ...values, [index]: val });
    setValue(parseFloat(val) || 0);
  };

  const handleSaveNewMarkup = () => {
    console.log("New Markup:", newValue, "Unit:", unit);
    setIsNewModalOpen(false);
    setNewValue("");
  };

  return (
    <div className="space-y-4 rounded-2xl">
      <h2 className="text-xl font-semibold">Item Markup</h2>

      <div
        className="flex items-center border border-dashed bg-[#FBEBE0] border-orange-400 rounded-2xl p-3 cursor-pointer transition-all"
        onClick={() => setSelected(1)}
      >
        <div className="w-5 h-5 flex items-center justify-center border border-primary rounded-sm mr-2 flex-shrink-0">
          {selected === 1 && (
            <Check
              className="text-white bg-primary rounded-sm p-[2px]"
              size={16}
            />
          )}
        </div>
        <input
          type="text"
          value={values[1]}
          onChange={(e) => handleChange(1, e.target.value)}
          placeholder="Discount Markup (5%)"
          className="w-full text-black bg-[#FBEBE0] outline-none border-none"
        />
      </div>

      {/* Second Input */}
      <div
        className="flex items-center border border-dashed rounded-lg bg-[#FBEBE0] border-orange-400 p-3 cursor-pointer transition-all"
        onClick={() => setSelected(2)}
      >
        <div className="w-5 h-5 flex items-center justify-center border border-primary rounded-sm mr-2 flex-shrink-0">
          {selected === 2 && (
            <Check
              className="text-white bg-primary rounded-sm p-[2px]"
              size={16}
            />
          )}
        </div>
        <input
          type="text"
          value={values[2]}
          onChange={(e) => handleChange(2, e.target.value)}
          placeholder="Retail Markup (30%)"
          className="w-full bg-transparent outline-none border-none text-black"
        />
      </div>

      <div className="mt-4">
        <button
          className="flex items-center text-base justify-center border-dashed border-orange-400 border w-full py-2 text-primary gap-2 hover:text-orange-500"
          onClick={() => setIsNewModalOpen(true)}
        >
          <FiPlus /> New Markup
        </button>
      </div>

      <CustomModal
        open={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="New Markup"
        maxWidth="md"
        actions={[
          {
            label: "Cancel",
            onClick: () => setIsNewModalOpen(false),
            variant: "secondary",
          },
          { label: "Add", onClick: handleSaveNewMarkup, variant: "primary" },
        ]}
      >
        <div className="space-y-5 h-32">
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Markup Name"
          />
          <input
            type="number"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Markup Rate (%)"
          />
        </div>

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
      </CustomModal>
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
