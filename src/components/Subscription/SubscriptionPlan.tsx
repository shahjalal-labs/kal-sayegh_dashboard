"use client";

import basic from "@/assets/dashboard/basicPackege.png";
import standard from "@/assets/dashboard/standardPackege.png";
import subscriptionOverlay from "@/assets/dashboard/subscriptionOverlay.png";
import ultimateProgram from "@/assets/dashboard/ultimateProgram.png";
import Image from "next/image";
import { useState } from "react";

export default function SubscriptionPlan() {
  const [modalOpen, setModalOpen] = useState(false);
  const [features, setFeatures] = useState([""]);
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("");

  const packages = [
    {
      title: "Basic Package",
      price: "£14/month",
      description:
        "Perfect for essential care to keep your lawn green. Basic treatments to maintain your garden.",
      image: basic,
      features: [
        "Spring Ready Treatment",
        "Summer Ready Treatment",
        "Oasis",
        "Email support",
      ],
    },
    {
      title: "Standard Package",
      price: "£54 / month",
      description: "Ideal for homeowners who want consistent lawn care.",
      image: standard,
      features: [
        "Everything in Basic",
        "Advanced weed control",
        "Soil health treatment",
        "Priority support",
      ],
      highlighted: true,
    },

    {
      title: "Ultimate Program",
      price: "£84 / month",
      description: "Our most comprehensive package for lush, vibrant lawns.",
      image: ultimateProgram,
      features: [
        "Full seasonal treatment",
        "Premium fertilization",
        "Pest protection",
        "Lawn aeration",
        "Priority support",
      ],
    },
  ];

  const addFeature = () => setFeatures([...features, ""]);

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  return (
    <div className="bg-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-semibold text-xl">Subscription Plan</h2>
        <button
          className="bg-primary text-white text-base rounded-full py-1 px-4"
          onClick={() => setModalOpen(true)}
        >
          + Add Plan
        </button>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {packages.map((pkg, index) => (
          <div
            key={index}
            className={`relative border rounded-lg p-6 flex flex-col gap-4 h-auto overflow-hidden ${
              pkg.highlighted
                ? "border-green-600 shadow-lg"
                : "border-gray-200 hover:shadow-md"
            }`}
          >
            {/* Overlay */}
            <div className="absolute inset-0 z-0 opacity-20">
              <Image
                src={subscriptionOverlay}
                alt="overlay"
                fill
                style={{ objectFit: "cover" }}
                className="opacity-40"
              />
            </div>

            <div className="relative z-10">
              <h3 className="text-lg font-semibold">{pkg.title}</h3>
              <p className="font-semibold text-primary">{pkg.price}</p>
              <p className="text-sm text-gray-600">{pkg.description}</p>
            </div>

            <div className="relative w-full h-48 mt-2 rounded-md overflow-hidden z-10">
              <Image
                src={pkg.image}
                alt={pkg.title}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>

            <ul className="list-disc list-inside text-gray-600 text-sm flex flex-col gap-1 z-10 mt-2">
              {pkg.features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-lg">
        <div className="mt-5 relative p-6 rounded-lg">
          {/* Overlay */}
          <div className="absolute inset-0 z-0 opacity-20 ">
            <Image
              src={subscriptionOverlay}
              alt="overlay"
              fill
              style={{ objectFit: "cover" }}
              className="opacity-30"
            />
          </div>

          <div className="relative z-10 ">
            <h3 className="text-base md:text-2xl font-bold">
              Year-Round Garden Care
            </h3>
            <p className="text-base font-medium">
              Keep your garden looking its best in every season with out Garden
              Maintenance Package.
            </p>
          </div>

          <div className="relative w-full h-48 mt-2 rounded-md overflow-hidden z-10 ">
            <Image
              src={basic}
              alt={"image"}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>

          <p>Stemming and edging.</p>
          <p>Stemming and edging.</p>
          <p>Stemming and edging.</p>
          <p>Stemming and edging.</p>

          <div className="bg-[#365633] border-[#126A19] border-4 rounded-md mt-3 ">
            <p className="text-center text-white text-xl mt-2 font-bold">
              Scheduled Visits
            </p>
            <p className="bg-[#36B840] text-center text-white p-2  fond-semibold">
              18 visits per year
            </p>
            <div className=" border-2">
              <p className="bg-[#446424] flex justify-between text-white items-center pl-2">
                February
                <span className="bg-[#CACFB9] text-black p-2">1 visits</span>
              </p>
              <p className="bg-[#446424] flex justify-between text-white items-center pl-2 border-t-2">
                March
                <span className="bg-[#CACFB9] text-black p-2">1 visits</span>
              </p>
              <p className="bg-[#446424] flex justify-between text-white items-center pl-2 border-t-2">
                April
                <span className="bg-[#CACFB9] text-black p-2">1 visits</span>
              </p>
              <p className="bg-[#446424] flex justify-between text-white items-center pl-2 border-t-2">
                May
                <span className="bg-[#CACFB9] text-black p-2">1 visits</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg p-6 relative">
            <h2 className="text-lg font-semibold mb-4">Add Plan</h2>

            {/* Plan Name & Price */}
            <div className="flex justify-between gap-4 mb-4">
              <div className="flex flex-col flex-1">
                <label
                  htmlFor="planName"
                  className="text-gray-700 font-medium mb-1"
                >
                  Plan Name
                </label>
                <input
                  id="planName"
                  type="text"
                  placeholder="Plan Name"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="border rounded-md p-2 w-full"
                />
              </div>

              <div className="flex flex-col flex-1">
                <label
                  htmlFor="planPrice"
                  className="text-gray-700 font-medium mb-1"
                >
                  Plan Price
                </label>
                <input
                  id="planPrice"
                  type="text"
                  placeholder="Plan Price"
                  value={planPrice}
                  onChange={(e) => setPlanPrice(e.target.value)}
                  className="border rounded-md p-2 w-full"
                />
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <div className="flex justify-between gap-4">
                <div className="flex flex-col flex-1">
                  <label
                    htmlFor="feature01"
                    className="text-gray-700 font-medium mb-1"
                  >
                    Feature 01
                  </label>
                  <input
                    id="feature01"
                    type="text"
                    placeholder="Type Here"
                    className="border rounded-md p-2 w-full"
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <label
                    htmlFor="feature02"
                    className="text-gray-700 font-medium mb-1"
                  >
                    Feature 02
                  </label>
                  <input
                    id="feature02"
                    type="text"
                    placeholder="Type Here"
                    className="border rounded-md p-2 w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={addFeature}
                  className="text-primary text-sm mt-2 border-primary  border rounded-full p-2 font-me"
                >
                  + Add More Feature
                </button>
              </div>
            </div>

            <div className="flex justify-start gap-3 mt-4">
              <div className="p-[1px] rounded-md bg-primary inline-block">
                <button
                  onClick={() => setModalOpen(false)}
                  className="bg-white text-primary px-6 py-2 rounded-md w-full"
                >
                  Cancel
                </button>
              </div>
              <button className="bg-primary text-white px-6 py-2 rounded-md">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
