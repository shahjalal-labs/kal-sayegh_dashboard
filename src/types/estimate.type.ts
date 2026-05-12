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
}

export interface LineItemTable {
  id: number;
  items: LineItem[];
}

export type FormatType = "DESCRIPTION" | "TABLE" | "IMAGE_PDF";
