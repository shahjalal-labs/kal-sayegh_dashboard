"use client";

import { useEffect, useState } from "react";

export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "date" | "select" | "textarea";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  step?: string;
  rows?: number;
  readOnly?: boolean;
}

interface DynamicFormProps {
  fields: FormField[];
  initialData?: any;
  onSubmit?: (data: any) => void;
  onChange?: (data: any) => void;
}

export default function DynamicForm({
  fields,
  initialData,
  onSubmit,
  onChange,
}: DynamicFormProps) {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const initialFormData: Record<string, any> = {};

    fields.forEach((field) => {
      initialFormData[field.name] = initialData?.[field.name] || "";
    });

    setFormData(initialFormData);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    const updatedData = {
      ...formData,
      [name]: value,
    };

    setFormData(updatedData);

    if (onChange) {
      onChange(updatedData);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) onSubmit(formData);
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

            {/* SELECT */}
            {field.type === "select" && field.options ? (
              <select
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                required={field.required}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Select {field.label}</option>
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              /* TEXTAREA */
              <textarea
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                placeholder={field.placeholder}
                rows={field.rows || 3}
                required={field.required}
                className="w-full px-4 py-2 border rounded-lg"
              />
            ) : (
              /* INPUT */
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                placeholder={field.placeholder}
                step={field.step}
                required={field.required}
                className="w-full px-4 py-2 border rounded-lg"
              />
            )}
          </div>
        ))}
      </div>
    </form>
  );
}
