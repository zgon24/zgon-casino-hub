import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, Plus, Trash2, Loader2, ImageIcon, Search, Library, Pencil 
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CatalogSlot {
  id: string;
  name: string;
  image_url: string | null;
  provider: string | null;
}

const SlotCatalog = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [slots, setSlots] = useState<CatalogSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Add form
  const [newName, setNewName] = useState("");
  const [newProvider, setNewProvider] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) loadSlots();
  }, [user]);

  const loadSlots = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("slot_catalog")
      .select("*")
      .order("name", { ascending: true });

    if (!error && data) setSlots(data as CatalogSlot[]);
    setLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setNewImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async () => {
    if (!newName.trim() || !user) {
      toast({ variant: "destructive", title: "Erro", description: "Preenche o nome da slot" });
      return;
    }

    setAddLoading(true);

    let imageUrl: string | null = null;
    if (newImageFile) {
      const fileExt = newImageFile.name.split('.').pop();
      const fileName = `catalog/${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('slot-images')
        .upload(fileName, newImageFile);
      
      if (!uploadError) {
        const { data } = supabase.storage.from('slot-images').getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      }
    }

    const { error } = await supabase.from("slot_catalog").insert({
      name: newName.trim(),
      provider: newProvider.trim() || null,
      image_url: imageUrl,
      user_id: user.id,
    });

    if (error) {
      const msg = error.message.includes("duplicate") 
        ? "Esta slot já existe no teu catálogo" 
        : "Não foi possível adicionar";
      toast({ variant: "destructive", title: "Erro", description: msg });
    } else {
      toast({ title: "Slot adicionada ao catálogo!" });
      setNewName("");
      setNewProvider("");
      setNewImageFile(null);
      setNewImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      loadSlots();
    }

    setAddLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("slot_catalog").delete().eq("id", id);
    if (!error) {
      setSlots(slots.filter(s => s.id !== id));
      toast({ title: "Slot removida do catálogo" });
    }
  };

  const filtered = slots.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/30 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/bonushunt" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Library className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-gradient-gold">Catálogo de Slots</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Add New Slot */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Adicionar ao Catálogo
            </CardTitle>
            <CardDescription>
              Adiciona slots para usar com autocomplete no Bonus Hunt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Imagem</Label>
                <div 
                  className="relative h-16 bg-secondary/50 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-center overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {newImagePreview ? (
                    <img src={newImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-muted-foreground" />
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm text-muted-foreground">Nome da Slot</Label>
                <Input placeholder="Ex: Gates of Olympus" value={newName} onChange={(e) => setNewName(e.target.value)} className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Provider</Label>
                <Input placeholder="Ex: Pragmatic Play" value={newProvider} onChange={(e) => setNewProvider(e.target.value)} className="bg-secondary/50" />
              </div>
              <Button onClick={handleAdd} disabled={addLoading} className="btn-gold text-primary-foreground font-semibold h-10">
                {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
                Adicionar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar slots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary/50"
          />
        </div>

        {/* Slots List */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{filtered.length} slots no catálogo</p>
          {filtered.length === 0 ? (
            <Card className="border-border/50 bg-card/50">
              <CardContent className="py-12 text-center text-muted-foreground">
                {searchQuery ? "Nenhuma slot encontrada" : "O teu catálogo está vazio. Adiciona slots acima!"}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filtered.map((slot) => (
                <Card key={slot.id} className="border-border/50 bg-card/50 overflow-hidden group">
                  <div className="flex items-center gap-3 p-3">
                    {slot.image_url ? (
                      <img src={slot.image_url} alt={slot.name} className="w-12 h-12 rounded object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-secondary flex items-center justify-center shrink-0">
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{slot.name}</p>
                      {slot.provider && <p className="text-xs text-muted-foreground truncate">{slot.provider}</p>}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border-border">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover "{slot.name}"?</AlertDialogTitle>
                          <AlertDialogDescription>Esta ação remove a slot do catálogo.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(slot.id)}>Remover</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SlotCatalog;
