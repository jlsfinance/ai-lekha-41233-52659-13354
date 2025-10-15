import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, FileText, Users, TrendingUp, Settings, LogOut, Book, Receipt, FileSpreadsheet, BarChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Gateway = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    const handleKeyPress = (e: KeyboardEvent) => {
      // Alt+G - Gateway
      if (e.altKey && e.key === 'g') {
        e.preventDefault();
        navigate('/gateway');
      }
      // Alt+A - Accounts
      else if (e.altKey && e.key === 'a') {
        e.preventDefault();
        navigate('/master/accounts');
      }
      // Alt+C - Clients
      else if (e.altKey && e.key === 'c') {
        e.preventDefault();
        navigate('/master/clients');
      }
      // Alt+D - Vendors
      else if (e.altKey && e.key === 'd') {
        e.preventDefault();
        navigate('/master/vendors');
      }
      // Alt+O - Company
      else if (e.altKey && e.key === 'o') {
        e.preventDefault();
        navigate('/master/companies');
      }
      // Alt+I - Items
      else if (e.altKey && e.key === 'i') {
        e.preventDefault();
        navigate('/master/items');
      }
      // Alt+V - Vouchers
      else if (e.altKey && e.key === 'v') {
        e.preventDefault();
        navigate('/vouchers');
      }
      // Alt+F1 - Ledgers
      else if (e.altKey && e.key === 'F1') {
        e.preventDefault();
        navigate('/reports/ledgers');
      }
      // Alt+F3 - Trial Balance
      else if (e.altKey && e.key === 'F3') {
        e.preventDefault();
        navigate('/reports/trial-balance');
      }
      // Alt+F4 - Balance Sheet
      else if (e.altKey && e.key === 'F4') {
        e.preventDefault();
        navigate('/reports/balance-sheet');
      }
      // Alt+F7 - Day Book
      else if (e.altKey && e.key === 'F7') {
        e.preventDefault();
        navigate('/reports/daybook');
      }
      // Alt+F9 - P&L
      else if (e.altKey && e.key === 'F9') {
        e.preventDefault();
        navigate('/reports/profit-loss');
      }
      // F5 - Payment
      else if (e.key === 'F5') {
        e.preventDefault();
        navigate('/voucher/payment');
      }
      // F6 - Receipt
      else if (e.key === 'F6') {
        e.preventDefault();
        navigate('/voucher/receipt');
      }
      // F7 - Journal
      else if (e.key === 'F7') {
        e.preventDefault();
        navigate('/voucher/journal');
      }
      // F8 - Sales
      else if (e.key === 'F8') {
        e.preventDefault();
        navigate('/voucher/sales');
      }
      // F9 - Purchase
      else if (e.key === 'F9') {
        e.preventDefault();
        navigate('/voucher/purchase');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out successfully" });
    navigate("/auth");
  };

  const menuItems = [
    {
      title: "Create",
      items: [
        { name: "Accounts", icon: Users, path: "/master/accounts", key: "Alt+A" },
        { name: "Clients", icon: Users, path: "/master/clients", key: "Alt+C" },
        { name: "Vendors", icon: Users, path: "/master/vendors", key: "Alt+D" },
        { name: "Company", icon: Users, path: "/master/companies", key: "Alt+O" },
        { name: "Items", icon: Book, path: "/master/items", key: "Alt+I" },
        { name: "Vouchers", icon: Receipt, path: "/vouchers", key: "Alt+V" },
      ]
    },
    {
      title: "Display",
      items: [
        { name: "Day Book", icon: Book, path: "/reports/daybook", key: "Alt+F7" },
        { name: "Ledgers", icon: FileText, path: "/reports/ledgers", key: "Alt+F1" },
        { name: "Trial Balance", icon: FileSpreadsheet, path: "/reports/trial-balance", key: "Alt+F3" },
        { name: "P & L A/c", icon: TrendingUp, path: "/reports/profit-loss", key: "Alt+F9" },
        { name: "Balance Sheet", icon: BarChart, path: "/reports/balance-sheet", key: "Alt+F4" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
              <Calculator className="w-7 h-7 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-primary">AccounTech Pro</h1>
                <p className="text-xs text-muted-foreground">Gateway of AccounTech</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/invoice/preview')}>
                Invoice
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/chat')}>
                AI Assistant
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Exit
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">Gateway of AccounTech</h2>
            <p className="text-sm text-muted-foreground">
              Press Alt+G for Gateway | F5-Payment | F6-Receipt | F7-Journal | F8-Sales | F9-Purchase
            </p>
          </div>

          {/* Menu Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menuItems.map((section, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">
                    {section.title}
                  </h3>
                  <div className="space-y-2">
                    {section.items.map((item, itemIdx) => (
                      <Button
                        key={itemIdx}
                        variant="ghost"
                        className="w-full justify-start hover:bg-primary/10"
                        onClick={() => {
                          console.log('Navigating to:', item.path);
                          navigate(item.path);
                        }}
                      >
                        <item.icon className="w-4 h-4 mr-3 text-primary" />
                        <span className="flex-1 text-left">{item.name}</span>
                        <span className="text-xs text-muted-foreground">{item.key}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Shortcuts Info */}
          <Card className="mt-6 bg-primary/5">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Keyboard Shortcuts
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div><kbd className="px-2 py-1 bg-muted rounded">F5</kbd> Payment</div>
                <div><kbd className="px-2 py-1 bg-muted rounded">F6</kbd> Receipt</div>
                <div><kbd className="px-2 py-1 bg-muted rounded">F7</kbd> Journal</div>
                <div><kbd className="px-2 py-1 bg-muted rounded">F8</kbd> Sales</div>
                <div><kbd className="px-2 py-1 bg-muted rounded">F9</kbd> Purchase</div>
                <div><kbd className="px-2 py-1 bg-muted rounded">Ctrl+A</kbd> Accept</div>
                <div><kbd className="px-2 py-1 bg-muted rounded">Esc</kbd> Cancel</div>
                <div><kbd className="px-2 py-1 bg-muted rounded">Alt+G</kbd> Gateway</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Gateway;