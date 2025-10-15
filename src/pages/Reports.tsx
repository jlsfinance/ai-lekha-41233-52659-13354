import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { db } from "@/utils/supabaseHelper";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

const Reports = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

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

  useEffect(() => {
    fetchData();
  }, [type]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await db.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please login to view reports",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // Fetch transactions
      const { data: txns, error: txnError } = await db
        .from('transactions')
        .select(`
          *,
          debit_account:accounts!transactions_debit_account_id_fkey(name),
          credit_account:accounts!transactions_credit_account_id_fkey(name),
          client:clients(name),
          vendor:vendors(name)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (txnError) throw txnError;

      // Fetch accounts for trial balance
      const { data: accts, error: acctError } = await db
        .from('accounts')
        .select('*')
        .eq('user_id', user.id);

      if (acctError) throw acctError;

      setTransactions(txns || []);
      setAccounts(accts || []);
    } catch (error: any) {
      toast({
        title: "Error fetching data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const reportTitles: any = {
    daybook: 'Day Book',
    ledgers: 'Ledger Report',
    'trial-balance': 'Trial Balance',
    'profit-loss': 'Profit & Loss Account',
    'balance-sheet': 'Balance Sheet',
  };

  const renderDayBook = () => {
    if (transactions.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg mb-2">No transactions yet</p>
          <p className="text-sm">Create vouchers to see data here</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/vouchers')}>
            Go to Vouchers
          </Button>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Party</TableHead>
            <TableHead>Debit Account</TableHead>
            <TableHead>Credit Account</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((txn) => (
            <TableRow key={txn.id}>
              <TableCell>{format(new Date(txn.date), 'dd/MM/yyyy')}</TableCell>
              <TableCell className="capitalize">{txn.type}</TableCell>
              <TableCell>{txn.reference_number || '-'}</TableCell>
              <TableCell>
                {txn.client?.name || txn.vendor?.name || '-'}
              </TableCell>
              <TableCell>{txn.debit_account?.name || '-'}</TableCell>
              <TableCell>{txn.credit_account?.name || '-'}</TableCell>
              <TableCell className="text-right">₹{Number(txn.amount).toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderTrialBalance = () => {
    if (accounts.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg mb-2">No accounts found</p>
          <p className="text-sm">Create accounts to see trial balance</p>
        </div>
      );
    }

    const totalDebit = accounts
      .filter(acc => ['asset', 'expense'].includes(acc.type))
      .reduce((sum, acc) => sum + Number(acc.current_balance || 0), 0);
    
    const totalCredit = accounts
      .filter(acc => ['liability', 'income'].includes(acc.type))
      .reduce((sum, acc) => sum + Number(acc.current_balance || 0), 0);

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Account Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Debit</TableHead>
            <TableHead className="text-right">Credit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((acc) => (
            <TableRow key={acc.id}>
              <TableCell>{acc.name}</TableCell>
              <TableCell className="capitalize">{acc.type}</TableCell>
              <TableCell className="text-right">
                {['asset', 'expense'].includes(acc.type) 
                  ? `₹${Number(acc.current_balance || 0).toFixed(2)}` 
                  : '-'}
              </TableCell>
              <TableCell className="text-right">
                {['liability', 'income'].includes(acc.type) 
                  ? `₹${Number(acc.current_balance || 0).toFixed(2)}` 
                  : '-'}
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="font-bold border-t-2">
            <TableCell colSpan={2}>Total</TableCell>
            <TableCell className="text-right">₹{totalDebit.toFixed(2)}</TableCell>
            <TableCell className="text-right">₹{totalCredit.toFixed(2)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }

    switch (type) {
      case 'daybook':
        return renderDayBook();
      case 'trial-balance':
        return renderTrialBalance();
      case 'ledgers':
      case 'profit-loss':
      case 'balance-sheet':
        return (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">Coming Soon</p>
            <p className="text-sm">This report is under development</p>
          </div>
        );
      default:
        return renderDayBook();
    }
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
            {renderContent()}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Reports;