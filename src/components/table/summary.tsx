import {
  useCreateMarkupMutation,
  useCreateTaxMutation,
  useGetAllMarkupsQuery,
  useGetAllTaxesQuery,
} from "@/redux/api/admin/estimateApi";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CreateMarkupModal,
  CreateTaxModal,
  DepositSummaryModal,
  DiscountSummaryModal,
  MarkupSummaryModal,
  TaxSummaryModal,
} from "../modal/PopUp";

export default function Summary({
  tableData,
  items,
  rowData,
  selectedItemsByTable,
  selectedMarkupsByRow,
  selectedTaxesByRow,
  summaryMarkup,
  summaryTax,
  summaryDiscount,
  summaryDeposit,

  onOpenMarkupSummary,
  onOpenMTaxSummary,
  onOpenDiscount,
  onOpenDeposit,
  markups,
  taxes,
  markupSummaryModal,
  setMarkupSummaryModal,
  taxSummaryModal,
  setTaxSummaryModal,
  discountModal,
  setDiscountModal,
  depositModal,
  setDepositModal,
  handleSelectSummaryMarkup,
  handleSelectSummaryTax,
  setSummaryDiscount,
  setSummaryDeposit,
}: any) {
  // API-backed lists (used when parent doesn't pass lists)
  const { data: allMarkup, isLoading: isLoadingMarkups } =
    useGetAllMarkupsQuery(undefined as any);
  const apiMarkups = allMarkup?.result ?? [];
  const { data: allTax, isLoading: isLoadingTaxes } = useGetAllTaxesQuery(
    undefined as any,
  );
  const apiTaxes = allTax?.result ?? [];

  // create mutations
  const [createMarkup] = useCreateMarkupMutation();
  const [createTax] = useCreateTaxMutation();

  // local create modal state
  const [openCreateMarkupModal, setOpenCreateMarkupModal] = useState(false);
  const [createMarkupValue, setCreateMarkupValue] = useState({
    name: "",
    percentage: "",
  });
  const [openCreateTaxModal, setOpenCreateTaxModal] = useState(false);
  const [createTaxValue, setCreateTaxValue] = useState({
    name: "",
    percentage: "",
  });

  const effectiveMarkups = markups ?? apiMarkups;
  const effectiveTaxes = taxes ?? apiTaxes;

  // local summary state when parent doesn't provide handlers
  const [localSummaryMarkup, setLocalSummaryMarkup] = useState<any>(
    summaryMarkup ?? null,
  );
  const [localSummaryTax, setLocalSummaryTax] = useState<any>(
    summaryTax ?? null,
  );
  const [localSummaryDiscount, setLocalSummaryDiscount] = useState<any>(
    summaryDiscount ?? null,
  );
  const [localSummaryDeposit, setLocalSummaryDeposit] = useState<any>(
    summaryDeposit ?? null,
  );

  const [localMarkupModal, setLocalMarkupModal] = useState(false);
  const [localTaxModal, setLocalTaxModal] = useState(false);
  const [localDiscountModal, setLocalDiscountModal] = useState(false);
  const [localDepositModal, setLocalDepositModal] = useState(false);

  // effective values/handlers (prefer parent)
  const effectiveSummaryMarkup = summaryMarkup ?? localSummaryMarkup;
  const effectiveSummaryTax = summaryTax ?? localSummaryTax;
  const effectiveSummaryDiscount = summaryDiscount ?? localSummaryDiscount;
  const effectiveSummaryDeposit = summaryDeposit ?? localSummaryDeposit;

  const openMarkup = onOpenMarkupSummary ?? (() => setLocalMarkupModal(true));
  const openTax = onOpenMTaxSummary ?? (() => setLocalTaxModal(true));
  const openDiscount = onOpenDiscount ?? (() => setLocalDiscountModal(true));
  const openDeposit = onOpenDeposit ?? (() => setLocalDepositModal(true));

  const closeMarkup = () => {
    if (setMarkupSummaryModal) setMarkupSummaryModal(false);
    else setLocalMarkupModal(false);
  };
  const closeTax = () => {
    if (setTaxSummaryModal) setTaxSummaryModal(false);
    else setLocalTaxModal(false);
  };
  const closeDiscount = () => {
    if (setDiscountModal) setDiscountModal(false);
    else setLocalDiscountModal(false);
  };
  const closeDeposit = () => {
    if (setDepositModal) setDepositModal(false);
    else setLocalDepositModal(false);
  };

  const selectMarkup = (m: any) => {
    if (handleSelectSummaryMarkup) handleSelectSummaryMarkup(m);
    else setLocalSummaryMarkup(m);
    closeMarkup();
  };

  const selectTax = (t: any) => {
    if (handleSelectSummaryTax) handleSelectSummaryTax(t);
    else setLocalSummaryTax(t);
    closeTax();
  };

  const setDiscountValue = useCallback(
    (val: number) => {
      if (setSummaryDiscount)
        setSummaryDiscount((prev: any) =>
          prev ? { ...prev, value: val } : { value: val, unit: "percent" },
        );
      else
        setLocalSummaryDiscount((prev: any) =>
          prev ? { ...prev, value: val } : { value: val, unit: "percent" },
        );
    },
    [setSummaryDiscount, setLocalSummaryDiscount],
  );

  const setDepositValue = useCallback(
    (val: number) => {
      if (setSummaryDeposit)
        setSummaryDeposit((prev: any) =>
          prev ? { ...prev, value: val } : { value: val, unit: "percent" },
        );
      else
        setLocalSummaryDeposit((prev: any) =>
          prev ? { ...prev, value: val } : { value: val, unit: "percent" },
        );
    },
    [setSummaryDeposit, setLocalSummaryDeposit],
  );

  const setDiscountPayload = useCallback(
    (payload: any) => {
      if (payload && typeof payload === "object") {
        if (setSummaryDiscount) setSummaryDiscount(payload);
        else setLocalSummaryDiscount(payload);
      } else {
        setDiscountValue(Number(payload) || 0);
      }
    },
    [setDiscountValue, setSummaryDiscount, setLocalSummaryDiscount],
  );

  const setDepositPayload = useCallback(
    (payload: any) => {
      if (payload && typeof payload === "object") {
        if (setSummaryDeposit) setSummaryDeposit(payload);
        else setLocalSummaryDeposit(payload);
      } else {
        setDepositValue(Number(payload) || 0);
      }
    },
    [setDepositValue, setSummaryDeposit, setLocalSummaryDeposit],
  );

  useEffect(
    () => setLocalSummaryMarkup(summaryMarkup ?? null),
    [summaryMarkup],
  );
  useEffect(() => setLocalSummaryTax(summaryTax ?? null), [summaryTax]);
  useEffect(
    () => setLocalSummaryDiscount(summaryDiscount ?? null),
    [summaryDiscount],
  );
  useEffect(
    () => setLocalSummaryDeposit(summaryDeposit ?? null),
    [summaryDeposit],
  );

  const handleCreateMarkup = async () => {
    try {
      await createMarkup({
        name: createMarkupValue.name,
        percentage: parseFloat(createMarkupValue.percentage),
      }).unwrap();
      setOpenCreateMarkupModal(false);
      setCreateMarkupValue({ name: "", percentage: "" });
      toast.success("Markup created successfully");
    } catch (error: any) {
      console.error("Failed to create markup:", error);
      toast.error("Failed to create markup", error);
    }
  };

  const handleCreateTax = async () => {
    try {
      await createTax({
        name: createTaxValue.name,
        percentage: parseFloat(createTaxValue.percentage),
      }).unwrap();
      setOpenCreateTaxModal(false);
      setCreateTaxValue({ name: "", percentage: "" });
      toast.success("Tax created successfully");
    } catch (error: any) {
      toast.error("Failed to create tax", error);
    }
  };

  const computeSubtotal = () => {
    let sum = 0;
    (items || []).forEach((item: any) => {
      const selectedItem = selectedItemsByTable?.[item.id];
      const rate = parseFloat(rowData?.[item.id]?.rate || "0") || 0;
      const quantity = parseFloat(rowData?.[item.id]?.quantity || "0") || 0;
      const selectedMarkup = selectedMarkupsByRow?.[item.id];

      const markupVal = selectedMarkup
        ? selectedMarkup.percentage != null
          ? selectedMarkup.percentage
          : selectedMarkup.amount || 0
        : selectedItem?.markUp?.percentage != null
          ? selectedItem.markUp.percentage
          : selectedItem?.markUp?.amount || 0;
      const isMarkupPercentage = selectedMarkup
        ? selectedMarkup.percentage != null
        : selectedItem?.markUp?.percentage != null;
      const taxPercent = selectedTaxesByRow?.[item.id]?.percentage || 0;
      const base = rate * quantity;
      const markupAmount = isMarkupPercentage
        ? base * (markupVal / 100)
        : markupVal;
      const subtotal = base + markupAmount;
      const taxAmount = subtotal * (taxPercent / 100);
      const total = subtotal + taxAmount;
      sum += total;
    });
    return sum;
  };

  const subtotal =
    (tableData?.items || []).reduce(
      (sum: number, it: any) => sum + Number(it.total || 0),
      0,
    ) || computeSubtotal();

  const computeTotal = () => {
    let total = subtotal;
    if (effectiveSummaryMarkup)
      total += subtotal * (effectiveSummaryMarkup.percentage / 100);
    if (effectiveSummaryTax)
      total += subtotal * (effectiveSummaryTax.percentage / 100);
    if (effectiveSummaryDiscount) {
      if (effectiveSummaryDiscount.unit === "percent")
        total -= total * (effectiveSummaryDiscount.value / 100);
      else total -= effectiveSummaryDiscount.value;
    }
    if (effectiveSummaryDeposit) {
      if (effectiveSummaryDeposit.unit === "percent")
        total += subtotal * (effectiveSummaryDeposit.value / 100);
      else total += effectiveSummaryDeposit.value;
    }
    return total;
  };

  const formatCurrency = (v: number) => `$${v.toFixed(2)}`;

  const computePreDiscountTotal = () => {
    let t = subtotal;
    if (effectiveSummaryMarkup)
      t += subtotal * (effectiveSummaryMarkup.percentage / 100);
    if (effectiveSummaryTax)
      t += subtotal * (effectiveSummaryTax.percentage / 100);
    return t;
  };

  const preDiscountTotal = computePreDiscountTotal();

  const grandTotal = computeTotal();
  const hasAnySummary = Boolean(
    effectiveSummaryMarkup ||
    effectiveSummaryTax ||
    effectiveSummaryDiscount ||
    effectiveSummaryDeposit,
  );

  const discountDisplay = (() => {
    const d = effectiveSummaryDiscount;
    if (!d) return "Add";
    if (d.unit === "percent") {
      const base = hasAnySummary ? grandTotal : preDiscountTotal;
      const amt = base * (d.value / 100);
      return `${d.value}% `;
    }
    return formatCurrency(d.value || 0);
  })();

  const depositDisplay = (() => {
    const dep = effectiveSummaryDeposit;
    if (!dep) return "Add";
    if (dep.unit === "percent") {
      const base = hasAnySummary ? grandTotal : subtotal;
      const amt = base * (dep.value / 100);
      return `${dep.value}% `;
    }
    return formatCurrency(dep.value || 0);
  })();

  const markupDisplay = (() => {
    const m = effectiveSummaryMarkup;
    if (!m) return "Add";
    const base = hasAnySummary ? grandTotal : subtotal;
    const amt = base * (m.percentage / 100);
    return `${m.percentage}% `;
  })();

  const taxDisplay = (() => {
    const t = effectiveSummaryTax;
    if (!t) return "Add";
    const base = hasAnySummary ? grandTotal : subtotal;
    const amt = base * (t.percentage / 100);
    return `${t.percentage}% `;
  })();

  return (
    <div className="flex justify-end mt-6 text-lg">
      <div className="w-80 space-y-2 text-base">
        <div className="flex justify-between border-b text-lg">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>Additional MarkUp</span>
          <span className="text-orange-500 cursor-pointer" onClick={openMarkup}>
            {markupDisplay}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Tax</span>
          <span className="text-orange-500 cursor-pointer" onClick={openTax}>
            {taxDisplay}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Discount</span>
          <span
            className="text-orange-500 cursor-pointer"
            onClick={openDiscount}
          >
            {discountDisplay}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Request a deposit</span>
          <span
            className="text-orange-500 cursor-pointer"
            onClick={openDeposit}
          >
            {depositDisplay}
          </span>
        </div>

        <div className="flex justify-between font-semibold pt-2 border-t">
          <span>Total (USD)</span>
          <span className="text-orange-500">${grandTotal.toFixed(2)}</span>
        </div>
      </div>
      <div>
        <MarkupSummaryModal
          open={markupSummaryModal ?? localMarkupModal}
          onClose={closeMarkup}
          markups={effectiveMarkups}
          onSelect={selectMarkup}
          onAdd={() => setOpenCreateMarkupModal(true)}
          loading={isLoadingMarkups}
        />

        <TaxSummaryModal
          open={taxSummaryModal ?? localTaxModal}
          onClose={closeTax}
          taxes={effectiveTaxes}
          onSelect={selectTax}
          onAdd={() => setOpenCreateTaxModal(true)}
          loading={isLoadingTaxes}
        />

        <DiscountSummaryModal
          open={discountModal ?? localDiscountModal}
          onClose={closeDiscount}
          value={effectiveSummaryDiscount}
          setValue={setDiscountPayload}
        />

        <DepositSummaryModal
          open={depositModal ?? localDepositModal}
          onClose={closeDeposit}
          value={effectiveSummaryDeposit}
          setValue={setDepositPayload}
        />

        <CreateMarkupModal
          open={openCreateMarkupModal}
          onClose={() => setOpenCreateMarkupModal(false)}
          value={createMarkupValue}
          setValue={setCreateMarkupValue}
          onSave={handleCreateMarkup}
        />
        <CreateTaxModal
          open={openCreateTaxModal}
          onClose={() => setOpenCreateTaxModal(false)}
          value={createTaxValue}
          setValue={setCreateTaxValue}
          onSave={handleCreateTax}
        />
      </div>
    </div>
  );
}
