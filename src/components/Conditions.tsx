import React from "react";

type Props = {
  className?: string;
};

const Conditions: React.FC<Props> = ({ className = "" }) => {
  const items = [
    "All deliveries of material, supplies, or equipment over roadways of the drives of the premises shall not incur liability to company.",
    "Geo paving and Sealcoating shall not be responsible for the following:",
    "Geo paving and Sealcoating will warrantee materials and workmanship for 1 year",
    "Any invoice not paid upon completion will be subject to interest of 5% per month. An invoice is considered paid when Geo paving and Sealcoating has payment in their possession.",
  ];

  return (
    <div className={`${className}`}>
      <h3 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">
        Terms and conditions:
      </h3>

      <ol className="space-y-3 text-base md:text-lg text-slate-700 leading-relaxed">
        {items.map((text, idx) => (
          <li key={idx} className="flex">
            <span className="font-medium mr-3 text-slate-900">{idx + 1})</span>
            <span>{text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Conditions;
