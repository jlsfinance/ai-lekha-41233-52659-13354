import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/utils/supabaseHelper";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Masters = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'g') {
        e.preventDefault();
        navigate('/gateway');
      } else if (e.key === 'Escape') {
        if (showForm) {
          setShowForm(false);
          setEditingId(null);
          setFormData({});
        } else {
          navigate('/gateway');
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'a' && showForm) {
        e.preventDefault();
        handleSubmit();
      } else if (e.altKey && e.key === 'c') {
        e.preventDefault();
        setShowForm(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate, showForm, formData]);

  // Fetch data based on type
  const { data: items, isLoading } = useQuery({
    queryKey: [type],
    queryFn: async () => {
      if (!type) return [];
      const { data, error } = await db.from(type).select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!type,
  });

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const payload = { ...data, user_id: user.id };
      
      if (editingId) {
        const { error } = await db.from(type!).update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await db.from(type!).insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [type] });
      toast({ title: editingId ? "Updated successfully" : "Created successfully" });
      setShowForm(false);
      setEditingId(null);
      setFormData({});
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from(type!).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [type] });
      toast({ title: "Deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    mutation.mutate(formData);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData(item);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate(id);
    }
  };

  const renderForm = () => {
    switch (type) {
      case 'accounts':
        return (
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <Label>Account Type *</Label>
              <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="asset">Asset</SelectItem>
                  <SelectItem value="liability">Liability</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Code</Label>
              <Input value={formData.code || ''} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
            </div>
            <div>
              <Label>Opening Balance</Label>
              <Input type="number" value={formData.opening_balance || 0} onChange={(e) => setFormData({ ...formData, opening_balance: parseFloat(e.target.value) })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </div>
        );
      
      case 'clients':
      case 'vendors':
        return (
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div>
              <Label>Address</Label>
              <Textarea value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            </div>
            <div>
              <Label>GSTIN</Label>
              <Input value={formData.gstin || ''} onChange={(e) => setFormData({ ...formData, gstin: e.target.value })} />
            </div>
          </div>
        );
      
      case 'companies':
        return (
          <div className="space-y-4">
            <div>
              <Label>Company Name *</Label>
              <Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div>
              <Label>Address</Label>
              <Textarea value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            </div>
            <div>
              <Label>GSTIN</Label>
              <Input value={formData.gstin || ''} onChange={(e) => setFormData({ ...formData, gstin: e.target.value })} />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (!type) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50 px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/gateway')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Gateway (Alt+G)
          </Button>
        </header>
        <main className="container mx-auto px-4 py-6 max-w-4xl">
          <h2 className="text-2xl font-bold mb-6">Masters</h2>
          <p>Select a master type from the gateway</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/gateway')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Gateway (Alt+G)
          </Button>
          {!showForm && (
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create (Alt+C)
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <h2 className="text-2xl font-bold mb-6 capitalize">{type}</h2>

        {showForm ? (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Edit' : 'Create New'}</CardTitle>
            </CardHeader>
            <CardContent>
              {renderForm()}
              <div className="flex gap-2 mt-6">
                <Button onClick={handleSubmit} disabled={mutation.isPending}>
                  {mutation.isPending ? 'Saving...' : 'Save (Ctrl+A)'}
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({});
                }}>
                  Cancel (Esc)
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {isLoading ? (
              <p>Loading...</p>
            ) : items && items.length > 0 ? (
              items.map((item: any) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        {type === 'accounts' && <p className="text-sm text-muted-foreground">Type: {item.type} | Balance: ₹{item.current_balance || 0}</p>}
                        {(type === 'clients' || type === 'vendors') && (
                          <p className="text-sm text-muted-foreground">{item.phone} | {item.email}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No items found. Create your first one!</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Card className="mt-6 bg-muted/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Shortcuts:</strong> Alt+C Create | Ctrl+A Save | Esc Cancel/Back
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Masters;