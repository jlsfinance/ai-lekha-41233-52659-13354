import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Receipt, CreditCard, FileText, ShoppingCart, Package } from "lucide-react";

const Vouchers = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'g') {
        e.preventDefault();
        navigate('/gateway');
      } else if (e.key === 'Escape') {
        navigate('/gateway');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  const voucherTypes = [
    { name: "Payment", icon: CreditCard, key: "F5", path: "/voucher/payment", color: "text-red-600" },
    { name: "Receipt", icon: Receipt, key: "F6", path: "/voucher/receipt", color: "text-green-600" },
    { name: "Journal", icon: FileText, key: "F7", path: "/voucher/journal", color: "text-blue-600" },
    { name: "Sales", icon: ShoppingCart, key: "F8", path: "/voucher/sales", color: "text-primary" },
    { name: "Purchase", icon: Package, key: "F9", path: "/voucher/purchase", color: "text-orange-600" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50 px-4 py-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/gateway')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Gateway (Alt+G)
        </Button>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <h2 className="text-2xl font-bold mb-6">Voucher Entry</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {voucherTypes.map((voucher, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(voucher.path)}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <voucher.icon className={`w-8 h-8 ${voucher.color}`} />
                    <div>
                      <h3 className="font-semibold text-lg">{voucher.name}</h3>
                      <p className="text-sm text-muted-foreground">Press {voucher.key}</p>
                    </div>
                  </div>
                  <kbd className="px-3 py-1 bg-muted rounded font-mono">{voucher.key}</kbd>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6 bg-muted/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Tip:</strong> Press Esc to go back | Ctrl+A to accept/save | Alt+D for date
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Vouchers;