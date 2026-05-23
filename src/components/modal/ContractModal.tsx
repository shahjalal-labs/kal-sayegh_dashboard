"use client";

import {
  useAddContractMutation,
  useDeleteContractMutation,
  useGetAllContractsQuery,
  useUpdateContractMutation,
} from "@/redux/api/admin/contractApi";
import { useEffect, useState } from "react";
import { CiEdit } from "react-icons/ci";
import { RiDeleteBin4Line } from "react-icons/ri";
import { toast } from "sonner";
import Swal from "sweetalert2";

type ContractItem = {
  id: string;
  title?: string;
  description?: string;
};

type ContractDraft = {
  id: string | null;
  title: string;
  description: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  selectedContractId?: string | null;
  onSelectContract?: (contractId: string) => void;
};

export default function ContractModal({
  open,
  onClose,
  selectedContractId = null,
  onSelectContract,
}: Props) {
  const [newContract, setNewContract] = useState({
    title: "",
    description: "",
  });
  const [editContract, setEditContract] = useState<ContractDraft>({
    id: null,
    title: "",
    description: "",
  });

  const [addContract, { isLoading: isAddingContract }] =
    useAddContractMutation();
  const { data: allContracts, refetch: refetchContracts } =
    useGetAllContractsQuery({});
  const [updateContract] = useUpdateContractMutation();
  const [deleteContract] = useDeleteContractMutation();

  const contracts: ContractItem[] = allContracts?.result?.data ?? [];

  useEffect(() => {
    if (open) refetchContracts();
  }, [open, refetchContracts]);

  const handleCreateContract = async () => {
    try {
      if (!newContract.title.trim() || !newContract.description.trim()) {
        toast.error("Please fill both contract fields");
        return;
      }

      const res = await addContract({
        title: newContract.title.trim(),
        description: newContract.description.trim(),
      }).unwrap();

      toast.success("Contract created successfully");

      const newContractId =
        res?.result?.id || res?.result?._id || res?.id || res?._id || "";

      if (newContractId && onSelectContract) onSelectContract(newContractId);

      setNewContract({ title: "", description: "" });
      await refetchContracts();
      onClose();
    } catch (error) {
      console.error("Failed to create contract:", error);
      toast.error("Failed to create contract");
    }
  };

  const handleDeleteContract = async (contractId: any) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to recover this contract!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteContract(contractId).unwrap();
      Swal.fire({
        title: "Deleted!",
        text: "Contract deleted successfully.",
        icon: "success",
        timer: 2000,
      });
    } catch (error) {
      console.error("Failed to delete contract:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to delete contract.",
        icon: "error",
        background: "#ffffff",
      });
    } finally {
      await refetchContracts();
    }
  };

  const handleUpdateContract = async () => {
    if (!editContract.id) return;

    try {
      await updateContract({
        contractId: editContract.id,
        title: editContract.title,
        description: editContract.description,
      }).unwrap();
      toast.success("Contract updated successfully");
      setEditContract({ id: null, title: "", description: "" });
      await refetchContracts();
      onClose();
    } catch (error) {
      console.error("Failed to update contract:", error);
      toast.error("Failed to update contract");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[980px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-200 bg-gradient-to-r from-orange-50 to-white px-5 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Select Contract
            </h2>
            <p className="text-base text-gray-500">
              Create a new contract or choose one from the list below.
            </p>
          </div>

          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full border border-gray-200 text-gray-500 transition hover:border-red-200 hover:text-red-500"
            aria-label="Close contract modal"
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div>
              <label className="mb-1 block text-base font-medium text-gray-700">
                Contract Title
              </label>
              <input
                type="text"
                value={editContract.id ? editContract.title : newContract.title}
                onChange={(e) =>
                  editContract.id
                    ? setEditContract((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    : setNewContract((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                }
                placeholder="e.g. Contract title 2"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-1 block text-base font-medium text-gray-700">
                Contract Description
              </label>
              <textarea
                value={
                  editContract.id
                    ? editContract.description
                    : newContract.description
                }
                onChange={(e) =>
                  editContract.id
                    ? setEditContract((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    : setNewContract((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                }
                placeholder="Describe the contract terms"
                rows={8}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex gap-3">
              {editContract.id ? (
                <>
                  <button
                    onClick={handleUpdateContract}
                    type="button"
                    className="flex-1 rounded-xl bg-primary px-4 py-3 font-medium text-white transition hover:bg-primary/90"
                  >
                    Update Contract
                  </button>
                  <button
                    onClick={() =>
                      setEditContract({ id: null, title: "", description: "" })
                    }
                    type="button"
                    className="flex-1 rounded-xl border bg-white px-4 py-3 font-medium text-gray-700"
                  >
                    Cancel Edit
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCreateContract}
                  disabled={isAddingContract}
                  type="button"
                  className="w-full rounded-xl bg-primary px-4 py-3 font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isAddingContract ? "Saving..." : "Save Contract"}
                </button>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                All Contracts
              </h3>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-base font-medium text-primary">
                {contracts.length} total
              </span>
            </div>

            <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
              {contracts.length > 0 ? (
                contracts.map((contractItem: ContractItem) => {
                  const isSelected = selectedContractId === contractItem.id;
                  const handleSelectContract = () => {
                    if (onSelectContract) onSelectContract(contractItem.id);
                    onClose();
                  };

                  return (
                    <div
                      key={contractItem.id}
                      role="button"
                      tabIndex={0}
                      onClick={handleSelectContract}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelectContract();
                        }
                      }}
                      className={`w-full rounded-2xl border p-4 text-left transition ${isSelected ? "border-primary bg-orange-50" : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/60"} cursor-pointer`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-base font-semibold text-gray-900">
                            {contractItem.title}
                          </p>
                          <p className="text-base leading-6 text-gray-600">
                            {contractItem.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteContract(contractItem.id);
                            }}
                            type="button"
                            aria-label={`Delete ${contractItem.title}`}
                          >
                            <RiDeleteBin4Line
                              size={20}
                              className="text-red-500 hover:text-red-600"
                            />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditContract({
                                id: contractItem.id,
                                title: contractItem.title || "",
                                description: contractItem.description || "",
                              });
                            }}
                            type="button"
                            aria-label={`Edit ${contractItem.title}`}
                          >
                            <CiEdit
                              size={25}
                              className="text-blue-600 hover:text-blue-700"
                            />
                          </button>

                          {isSelected ? (
                            <span className="rounded-full bg-primary px-3 py-1 text-base font-medium text-white">
                              Selected
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-base text-gray-400">
                  No contracts found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
