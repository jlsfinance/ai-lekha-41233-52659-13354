import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ImportStats {
  items: number;
  ledgers: number;
  vouchers: number;
  parties: number;
}

const TallyImport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (ext === 'xml' || ext === 'tsf') {
        setFile(selectedFile);
        setError("");
      } else {
        setError("Please select a valid Tally backup file (.xml or .tsf)");
        setFile(null);
      }
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setProgress(10);
    setError("");
    
    try {
      // Read file content
      const fileContent = await file.text();
      setProgress(30);

      // Call edge function to parse Tally data
      const { data, error: parseError } = await supabase.functions.invoke('parse-tally', {
        body: { xmlContent: fileContent }
      });

      if (parseError) throw parseError;

      setProgress(60);

      // Import data into database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { items = [], ledgers = [], vouchers = [], parties = [] } = data;

      // Import items
      if (items.length > 0) {
        const itemsToInsert = items.map((item: any) => ({
          user_id: user.id,
          name: item.name,
          category: item.category || 'goods',
          hsn_code: item.hsnCode,
          unit: item.unit || 'Nos',
          rate: parseFloat(item.rate || 0),
          tax_rate: parseFloat(item.taxRate || 0),
          description: item.description
        }));

        await supabase.from('items' as any).insert(itemsToInsert as any);
      }

      setProgress(75);

      // Import ledgers as accounts
      if (ledgers.length > 0) {
        const accountsToInsert = ledgers.map((ledger: any) => ({
          user_id: user.id,
          name: ledger.name,
          type: mapLedgerType(ledger.type),
          opening_balance: parseFloat(ledger.openingBalance || 0),
          current_balance: parseFloat(ledger.closingBalance || 0)
        }));

        await supabase.from('accounts' as any).insert(accountsToInsert as any);
      }

      setProgress(85);

      // Import parties (clients/vendors)
      if (parties.length > 0) {
        const clientsToInsert = parties
          .filter((p: any) => p.type === 'customer')
          .map((party: any) => ({
            user_id: user.id,
            name: party.name,
            gstin: party.gstin,
            phone: party.phone,
            address: party.address,
            outstanding_balance: parseFloat(party.outstanding || 0)
          }));

        const vendorsToInsert = parties
          .filter((p: any) => p.type === 'supplier')
          .map((party: any) => ({
            user_id: user.id,
            name: party.name,
            gstin: party.gstin,
            phone: party.phone,
            address: party.address,
            outstanding_balance: parseFloat(party.outstanding || 0)
          }));

        if (clientsToInsert.length > 0) {
          await supabase.from('clients' as any).insert(clientsToInsert as any);
        }
        if (vendorsToInsert.length > 0) {
          await supabase.from('vendors' as any).insert(vendorsToInsert as any);
        }
      }

      setProgress(100);

      setImportStats({
        items: items.length,
        ledgers: ledgers.length,
        vouchers: vouchers.length,
        parties: parties.length
      });

      toast({
        title: "Import Successful!",
        description: `Imported ${items.length} items, ${ledgers.length} ledgers, ${parties.length} parties`,
      });

    } catch (err: any) {
      console.error('Import error:', err);
      setError(err.message || "Failed to import Tally data");
      toast({
        title: "Import Failed",
        description: err.message || "An error occurred during import",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const mapLedgerType = (tallyType: string): string => {
    const type = tallyType?.toLowerCase() || '';
    if (type.includes('bank') || type.includes('cash')) return 'asset';
    if (type.includes('capital') || type.includes('loan')) return 'liability';
    if (type.includes('sales') || type.includes('income')) return 'income';
    if (type.includes('purchase') || type.includes('expense')) return 'expense';
    return 'asset';
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
              <FileText className="w-6 h-6" />
              Import Tally Backup
            </CardTitle>
            <CardDescription>
              Upload your Tally backup file (.xml or .tsf) to import data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!importStats ? (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tally-file">Select Tally Backup File</Label>
                    <Input
                      id="tally-file"
                      type="file"
                      accept=".xml,.tsf"
                      onChange={handleFileChange}
                      disabled={importing}
                    />
                    <p className="text-sm text-muted-foreground">
                      Supported formats: .xml, .tsf
                    </p>
                  </div>

                  {file && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
                      </AlertDescription>
                    </Alert>
                  )}

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {importing && (
                    <div className="space-y-2">
                      <Progress value={progress} className="w-full" />
                      <p className="text-sm text-center text-muted-foreground">
                        Importing... {progress}%
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold text-sm">What will be imported:</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Stock Items → Items Master</li>
                    <li>• Ledgers → Chart of Accounts</li>
                    <li>• Parties → Clients/Vendors</li>
                    <li>• Vouchers → Transactions</li>
                  </ul>
                </div>

                <Button
                  onClick={handleImport}
                  disabled={!file || importing}
                  className="w-full"
                  size="lg"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {importing ? "Importing..." : "Import Data"}
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    Import completed successfully!
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-primary">{importStats.items}</div>
                      <div className="text-sm text-muted-foreground">Items</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-primary">{importStats.ledgers}</div>
                      <div className="text-sm text-muted-foreground">Ledgers</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-primary">{importStats.parties}</div>
                      <div className="text-sm text-muted-foreground">Parties</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-primary">{importStats.vouchers}</div>
                      <div className="text-sm text-muted-foreground">Vouchers</div>
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
                  onClick={() => {
                    setImportStats(null);
                    setFile(null);
                    setProgress(0);
                  }}
                  variant="secondary"
                  className="w-full"
                >
                  Import Another File
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TallyImport;
