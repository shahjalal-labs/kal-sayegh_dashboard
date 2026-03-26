"use client";

import { useEffect, useState } from "react";

export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "date" | "select" | "textarea";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[]; // For select type
  step?: string;
  rows?: number; // For textarea
}

interface DynamicFormProps {
  fields: FormField[];
  initialData?: any;
  onSubmit: (data: any) => void;
}

export default function DynamicForm({
  fields,
  initialData,
  onSubmit,
}: DynamicFormProps) {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Initialize empty form
      const initialFormData: any = {};
      fields.forEach((field) => {
        initialFormData[field.name] = "";
      });
      setFormData(initialFormData);
    }
  }, [initialData, fields]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {fields.map((field) => (
          <div
            key={field.name}
            className={field.type === "textarea" ? "col-span-2" : ""}
          >
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {field.type === "select" && field.options ? (
              <select
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                required={field.required}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select {field.label}</option>
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                placeholder={field.placeholder}
                rows={field.rows || 3}
                required={field.required}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            ) : (
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                placeholder={field.placeholder}
                step={field.step}
                required={field.required}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            )}
          </div>
        ))}
      </div>
    </form>
  );
}
