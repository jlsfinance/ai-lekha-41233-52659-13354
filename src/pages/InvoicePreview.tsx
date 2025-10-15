import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { CompactInvoice } from "@/components/CompactInvoice";

const InvoicePreview = () => {
  const navigate = useNavigate();

  // Sample data - ye real data se replace hoga
  const sampleInvoice = {
    company: {
      name: "ABC Trading Company",
      address: "123, Market Road, Delhi - 110001",
      phone: "9876543210",
      email: "info@abctrading.com"
    },
    customer: {
      name: "XYZ Enterprises",
      address: "456, Business Park, Mumbai",
      phone: "9123456789"
    },
    invoice: {
      number: "INV-2025-001",
      date: new Date(),
      items: [
        { description: "Product A", quantity: 10, rate: 500, amount: 5000 },
        { description: "Product B", quantity: 5, rate: 800, amount: 4000 },
        { description: "Service Charges", quantity: 1, rate: 1000, amount: 1000 },
      ],
      subtotal: 10000,
      total: 10000
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50 px-4 py-3 print:hidden">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/gateway')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print (Ctrl+P)
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-4 print:hidden">
          <h2 className="text-2xl font-bold">Invoice Preview</h2>
          <p className="text-sm text-muted-foreground">
            Compact format - saves maximum paper (A5 size recommended)
          </p>
        </div>

        <CompactInvoice {...sampleInvoice} />
      </main>
    </div>
  );
};

export default InvoicePreview;