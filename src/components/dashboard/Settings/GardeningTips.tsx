"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useAllTipsQuery, useCreateTipsMutation } from "@/redux/api/authApi";
import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { toast } from "sonner";

export interface Tip {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function GardeningTips() {
  const { data: allTips, isLoading, refetch } = useAllTipsQuery(undefined);
  const tips = allTips?.result;

  const [createTips] = useCreateTipsMutation();
  const [isOpen, setIsOpen] = useState(false);

  // dynamic array for multiple tips
  const [newTips, setNewTips] = useState<
    { title: string; description: string }[]
  >([{ title: "", description: "" }]);

  // handle input change for each tip
  const handleInputChange = (
    index: number,
    field: "title" | "description",
    value: string,
  ) => {
    const updatedTips = [...newTips];
    updatedTips[index][field] = value;
    setNewTips(updatedTips);
  };

  // add new input section
  const handleAddSection = () => {
    setNewTips([...newTips, { title: "", description: "" }]);
  };

  const handleCreateTips = async () => {
    try {
      for (const tip of newTips) {
        if (tip.title || tip.description) {
          await createTips(tip).unwrap();
        }
      }
      toast.success("Tips created successfully!");
      setNewTips([{ title: "", description: "" }]);
      setIsOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create tips");
    }
  };

  return (
    <main className="">
      <div className="flex justify-between">
        <h1 className="text-lg md:text-3xl font-bold ">
          Referral and Discount
        </h1>

        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => setIsOpen(true)}
            variant="outline"
            className="rounded-full border-primary text-primary font-semibold"
          >
            + Add Tips
          </Button>
        </div>
      </div>

      <div className="bg-[#FFFFFF] p-6">
        <Accordion type="single" collapsible className="space-y-2">
          {tips?.length > 0 ? (
            tips.map((tip: Tip) => (
              <AccordionItem
                key={tip.id}
                value={tip.id}
                className="border-b border-gray-200 border-dashed last:border-b-0"
              >
                <AccordionTrigger className="text-base font-semibold text-gray-900 py-4 hover:no-underline">
                  {tip.title || "No Title"}
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <p className="text-gray-700">
                    {tip.description || "No Description"}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))
          ) : (
            <p className="text-gray-500">No tips available</p>
          )}
        </Accordion>
      </div>

      {/* Modal */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto w-full max-w-[1000px] rounded-xl bg-white p-6 shadow-lg">
            <Dialog.Title className="text-xl font-bold mb-4">
              Add Gardening Tips
            </Dialog.Title>

            <div className="space-y-4">
              {newTips.map((tip, index) => (
                <div key={index} className="border-b border-gray-200 pb-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      placeholder="Enter title"
                      value={tip.title}
                      onChange={(e) =>
                        handleInputChange(index, "title", e.target.value)
                      }
                      className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="mt-2">
                    <label className="block text-gray-700 font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      placeholder="Enter description"
                      rows={3}
                      value={tip.description}
                      onChange={(e) =>
                        handleInputChange(index, "description", e.target.value)
                      }
                      className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-2">
              <Button
                variant="outline"
                className="border-primary rounded-lg border-2 text-primary"
                onClick={handleAddSection}
              >
                + Add More Section
              </Button>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-start gap-3 mt-4">
              <div className="p-[1px] rounded-md bg-primary inline-block">
                <button
                  className="bg-white text-primary px-6 py-2 rounded-md w-full"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </button>
              </div>
              <button
                className="bg-primary text-white px-6 py-2 rounded-md"
                onClick={handleCreateTips}
              >
                Save Change
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </main>
  );
}
