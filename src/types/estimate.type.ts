// Add these interfaces
export interface LineItem {
  id: string;
  description: string;
  itemName: string;
  markUp: number;
  quantity: number;
  tax: number;
  total: number;
  originalItem?: any;
  percentage: number;
  amount: number;
  rate: number; // Added rate field
  format?: FormatType;
}

export interface LineItemTable {
  id: number;
  items: LineItem[];
  format: FormatType;
}

export type FormatType = "DESCRIPTION" | "TABLE" | "IMAGE_PDF";
