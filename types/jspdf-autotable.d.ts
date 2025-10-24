// types/jspdf-autotable.d.ts
import jsPDF from "jspdf";

export interface AutoTableOptions {
  startY?: number;
  head?: string[][];
  body?: (string | number)[][];
  headStyles?: Record<string, any>;
  styles?: Record<string, any>;
  alternateRowStyles?: Record<string, any>;
  margin?: { left?: number; right?: number };
}

export interface LastAutoTable {
  finalY: number;
  [key: string]: unknown; // permite propriedades extras
}

declare module "jspdf" {
  interface jsPDF {
    autoTable(options: AutoTableOptions): jsPDF;
    lastAutoTable?: LastAutoTable;
  }
}
