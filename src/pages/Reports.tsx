import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Reports = () => {
  const { type } = useParams();
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

  const reportTitles: any = {
    daybook: 'Day Book',
    ledgers: 'Ledger Report',
    'trial-balance': 'Trial Balance',
    'profit-loss': 'Profit & Loss Account',
    'balance-sheet': 'Balance Sheet',
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50 px-4 py-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/gateway')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Gateway (Alt+G)
        </Button>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{reportTitles[type || 'daybook']}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg mb-2">No transactions yet</p>
              <p className="text-sm">Create vouchers to see data here</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate('/vouchers')}>
                Go to Vouchers
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Reports;