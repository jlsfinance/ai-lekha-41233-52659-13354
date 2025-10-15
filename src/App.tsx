import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Gateway from "./pages/Gateway";
import Vouchers from "./pages/Vouchers";
import VoucherEntry from "./pages/VoucherEntry";
import Masters from "./pages/Masters";
import Reports from "./pages/Reports";
import InvoicePreview from "./pages/InvoicePreview";
import ItemsMaster from "./pages/ItemsMaster";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Gateway />} />
          <Route path="/gateway" element={<Gateway />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/vouchers" element={<Vouchers />} />
          <Route path="/voucher/:type" element={<VoucherEntry />} />
          <Route path="/masters" element={<Masters />} />
          <Route path="/master/:type" element={<Masters />} />
          <Route path="/master/items" element={<ItemsMaster />} />
          <Route path="/reports/:type" element={<Reports />} />
          <Route path="/invoice/preview" element={<InvoicePreview />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
