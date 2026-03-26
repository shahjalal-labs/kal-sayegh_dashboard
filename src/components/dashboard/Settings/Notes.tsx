"use client";

import { Info } from "lucide-react";
import { useState } from "react";

export default function Notes() {
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    console.log("Notes saved:", notes);
  };

  return (
    <div className="w-full min-h-screen bg-secondary p-6 rounded-md">
      <div className="max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-start gap-2 mb-12">
          <h1 className="text-3xl font-semibold text-slate-900">Notes</h1>
          <Info className="w-5 h-5 text-slate-500" />
        </div>

        {/* Additional Notes Section */}
        <div className="space-y-3 mb-8">
          <label className="block text-xl font-medium text-slate-900">
            Additional Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional Notes"
            className="w-full h-48 px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent resize-none"
          />
        </div>

        <button
          onClick={handleSave}
          className="px-8 py-3 bg-primary text-white font-semibold rounded-2xl hover:bg-primary/90 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
}
