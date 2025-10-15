import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Database, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/utils/supabaseHelper";
import { generateDemoItems, generateDemoParties, generateDemoTransactions, generateDemoInvoiceItems } from "@/utils/demoData";

const DemoData = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Generate and insert items
      const items = generateDemoItems(100);
      const { data: insertedItems, error: itemsError } = await db
        .from('items')
        .insert(items.map((item: any) => ({ ...item, user_id: user.id })))
        .select('id');
      
      if (itemsError) throw itemsError;

      // Generate and insert clients
      const clients = generateDemoParties(30);
      const { data: insertedClients, error: clientsError } = await db
        .from('clients')
        .insert(clients.map((client: any) => ({ ...client, user_id: user.id })))
        .select('id');
      
      if (clientsError) throw clientsError;

      // Generate and insert vendors
      const vendors = generateDemoParties(20);
      const { data: insertedVendors, error: vendorsError } = await db
        .from('vendors')
        .insert(vendors.map((vendor: any) => ({ ...vendor, user_id: user.id })))
        .select('id');
      
      if (vendorsError) throw vendorsError;

      // Get account IDs for transactions
      const { data: accounts } = await db
        .from('accounts')
        .select('id')
        .eq('user_id', user.id);

      if (!accounts || accounts.length < 2) {
        throw new Error("Need at least 2 accounts. Please check your account setup.");
      }

      const accountIds = accounts?.map((a: any) => a.id) || [];
      const clientIds = insertedClients?.map((c: any) => c.id) || [];
      const vendorIds = insertedVendors?.map((v: any) => v.id) || [];

      // Generate and insert transactions
      const transactions = generateDemoTransactions(200, accountIds, clientIds, vendorIds);
      const { data: insertedTxns, error: txnsError } = await db
        .from('transactions')
        .insert(transactions.map((txn: any) => ({ ...txn, user_id: user.id })))
        .select('id, type');
      
      if (txnsError) throw txnsError;

      // Generate invoice items for sales and purchase transactions
      const salesAndPurchaseTxns = insertedTxns?.filter((t: any) => 
        t.type === 'sales' || t.type === 'purchase'
      ) || [];
      
      if (salesAndPurchaseTxns.length > 0 && insertedItems && insertedItems.length > 0) {
        const itemIds = insertedItems.map((i: any) => i.id);
        const txnIds = salesAndPurchaseTxns.map((t: any) => t.id);
        const invoiceItems = generateDemoInvoiceItems(txnIds, itemIds);
        
        const { error: invoiceError } = await db
          .from('invoice_items')
          .insert(invoiceItems);
        
        if (invoiceError) throw invoiceError;
      }

      setCompleted(true);
      toast({
        title: "Demo Data Generated!",
        description: "Successfully created 100+ items, 50+ parties, and 200+ transactions",
      });

    } catch (error: any) {
      console.error('Demo data generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate demo data",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/gateway')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Gateway
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Database className="w-6 h-6" />
              Generate Demo Data
            </CardTitle>
            <CardDescription>
              Generate sample data for testing and demonstration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!completed ? (
              <>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This will create demo data in your database. You can delete it later from the respective masters.
                  </AlertDescription>
                </Alert>

                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <h3 className="font-semibold">What will be generated:</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span>100 Items</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span>30 Clients</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span>20 Vendors</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span>200 Transactions</span>
                    </div>
                  </div>
                  <div className="pt-2 text-sm text-muted-foreground">
                    <p>• Categories: Groceries, Electronics, Clothing, Household, Stationery</p>
                    <p>• Date Range: Last 6 months</p>
                    <p>• Includes GST and invoice details</p>
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full"
                  size="lg"
                >
                  <Database className="w-4 h-4 mr-2" />
                  {generating ? "Generating..." : "Generate Demo Data"}
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    Demo data generated successfully!
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-primary">100</div>
                      <div className="text-sm text-muted-foreground">Items</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-primary">50</div>
                      <div className="text-sm text-muted-foreground">Parties</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-primary">200</div>
                      <div className="text-sm text-muted-foreground">Transactions</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-primary">500+</div>
                      <div className="text-sm text-muted-foreground">Line Items</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => navigate('/master/items')} className="flex-1">
                    View Items
                  </Button>
                  <Button onClick={() => navigate('/vouchers')} variant="outline" className="flex-1">
                    View Vouchers
                  </Button>
                </div>

                <Button
                  onClick={() => setCompleted(false)}
                  variant="secondary"
                  className="w-full"
                >
                  Generate More Data
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DemoData;
