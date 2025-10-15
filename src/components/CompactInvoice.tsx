import { format } from "date-fns";
import { Card } from "./ui/card";

interface InvoiceProps {
  company: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  customer: {
    name: string;
    address?: string;
    phone?: string;
  };
  invoice: {
    number: string;
    date: Date;
    items: Array<{
      description: string;
      quantity: number;
      rate: number;
      amount: number;
    }>;
    subtotal: number;
    total: number;
  };
}

export const CompactInvoice = ({ company, customer, invoice }: InvoiceProps) => {
  return (
    <Card className="p-4 max-w-3xl bg-white text-black print:shadow-none">
      {/* Header - Compact */}
      <div className="border-b-2 border-black pb-2 mb-2">
        <h1 className="text-xl font-bold text-center">{company.name}</h1>
        <p className="text-xs text-center">{company.address}</p>
        <p className="text-xs text-center">Ph: {company.phone} | {company.email}</p>
      </div>

      {/* Invoice Title */}
      <h2 className="text-lg font-bold text-center border-y border-black py-1 mb-2">
        TAX INVOICE
      </h2>

      {/* Customer & Invoice Details - Side by side to save space */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
        <div>
          <p className="font-semibold">Bill To:</p>
          <p className="font-bold">{customer.name}</p>
          <p>{customer.address}</p>
          <p>Ph: {customer.phone}</p>
        </div>
        <div className="text-right">
          <p><span className="font-semibold">Invoice #:</span> {invoice.number}</p>
          <p><span className="font-semibold">Date:</span> {format(invoice.date, 'dd/MM/yyyy')}</p>
        </div>
      </div>

      {/* Items Table - Compact */}
      <table className="w-full text-xs border-collapse mb-2">
        <thead>
          <tr className="border-y-2 border-black">
            <th className="text-left py-1 px-1">#</th>
            <th className="text-left py-1 px-1">Description</th>
            <th className="text-right py-1 px-1">Qty</th>
            <th className="text-right py-1 px-1">Rate</th>
            <th className="text-right py-1 px-1">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-300">
              <td className="py-1 px-1">{idx + 1}</td>
              <td className="py-1 px-1">{item.description}</td>
              <td className="text-right py-1 px-1">{item.quantity}</td>
              <td className="text-right py-1 px-1">₹{item.rate.toFixed(2)}</td>
              <td className="text-right py-1 px-1">₹{item.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals - Compact, right aligned */}
      <div className="text-xs ml-auto" style={{ width: '200px' }}>
        <div className="flex justify-between border-t border-black pt-1">
          <span className="font-semibold">Subtotal:</span>
          <span>₹{invoice.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-t-2 border-black pt-1 font-bold">
          <span>Total:</span>
          <span>₹{invoice.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Footer - Ultra compact */}
      <div className="mt-3 pt-2 border-t border-black text-xs">
        <div className="flex justify-between items-end">
          <div>
            <p className="font-semibold text-[10px]">Terms & Conditions:</p>
            <p className="text-[9px]">Payment due within 30 days</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] mb-8">For {company.name}</p>
            <p className="border-t border-black inline-block px-8 text-[9px]">Authorized Sign</p>
          </div>
        </div>
      </div>

      {/* Print instruction */}
      <p className="text-center text-[8px] text-gray-500 mt-2 print:hidden">
        Press Ctrl+P to print | Design optimized for minimal paper usage
      </p>
    </Card>
  );
};

// Print-specific styles
export const printStyles = `
  @media print {
    @page {
      size: A5;
      margin: 5mm;
    }
    body {
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .print\\:hidden {
      display: none !important;
    }
  }
`;
