import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Upload, ImageIcon, Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface CatalogSlot {
  id: string;
  name: string;
  image_url: string | null;
  provider: string | null;
}

interface AddSlotFormProps {
  bonusHuntId: string;
  slotsCount: number;
  onSlotAdded: () => void;
}

const AddSlotForm = ({ bonusHuntId, slotsCount, onSlotAdded }: AddSlotFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [slotName, setSlotName] = useState("");
  const [betSize, setBetSize] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<CatalogSlot[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCatalogSlot, setSelectedCatalogSlot] = useState<CatalogSlot | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Search catalog when name changes
  useEffect(() => {
    const searchCatalog = async () => {
      if (slotName.length < 2 || !user) {
        setSuggestions([]);
        return;
      }

      setSearchLoading(true);
      const { data, error } = await supabase
        .from("slot_catalog")
        .select("*")
        .ilike("name", `%${slotName}%`)
        .limit(8);

      if (!error && data) {
        setSuggestions(data as CatalogSlot[]);
        setShowSuggestions(data.length > 0);
      }
      setSearchLoading(false);
    };

    const debounce = setTimeout(searchCatalog, 300);
    return () => clearTimeout(debounce);
  }, [slotName, user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectSuggestion = (slot: CatalogSlot) => {
    setSlotName(slot.name);
    setSelectedCatalogSlot(slot);
    if (slot.image_url) {
      setImagePreview(slot.image_url);
      setImageFile(null); // No need to upload, use catalog URL
    }
    setShowSuggestions(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setSelectedCatalogSlot(null); // Clear catalog selection if uploading new image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${bonusHuntId}/${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('slot-images')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('slot-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleAddSlot = async () => {
    if (!slotName || !betSize) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preenche o nome da slot e o bet",
      });
      return;
    }

    const bet = parseFloat(betSize);
    if (isNaN(bet) || bet <= 0) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Bet inválido",
      });
      return;
    }

    setIsLoading(true);

    let imageUrl: string | null = selectedCatalogSlot?.image_url || null;
    
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    const { error } = await supabase
      .from("slots")
      .insert({
        bonus_hunt_id: bonusHuntId,
        slot_name: slotName,
        bet_size: bet,
        cost: bet,
        status: "pending",
        slot_order: slotsCount,
        image_url: imageUrl,
      });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível adicionar a slot",
      });
      setIsLoading(false);
      return;
    }

    // Save to catalog if it's a new slot (not from catalog)
    if (!selectedCatalogSlot && user && imageUrl) {
      await supabase
        .from("slot_catalog")
        .upsert(
          { name: slotName, image_url: imageUrl, user_id: user.id },
          { onConflict: "idx_slot_catalog_name_user" }
        )
        .select();
    }

    // Reset form
    setSlotName("");
    setBetSize("");
    setImageFile(null);
    setImagePreview(null);
    setSelectedCatalogSlot(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    setIsLoading(false);
    onSlotAdded();
  };

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Adicionar Slot
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Image Upload / Preview */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Imagem</Label>
            <div 
              className="relative h-20 bg-secondary/50 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-center overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <ImageIcon className="w-6 h-6 mb-1" />
                  <span className="text-xs">Carregar</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* Slot Name with Autocomplete */}
          <div className="space-y-2 relative" ref={dropdownRef}>
            <Label className="text-sm text-muted-foreground">Nome da Slot</Label>
            <div className="relative">
              <Input
                placeholder="Ex: Gates of Olympus"
                value={slotName}
                onChange={(e) => {
                  setSlotName(e.target.value);
                  setSelectedCatalogSlot(null);
                }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className="bg-secondary/50 pr-8"
              />
              {searchLoading && (
                <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
              )}
              {!searchLoading && slotName.length >= 2 && (
                <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl max-h-64 overflow-y-auto">
                {suggestions.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-secondary/50 transition-colors text-left"
                    onClick={() => selectSuggestion(slot)}
                  >
                    {slot.image_url ? (
                      <img
                        src={slot.image_url}
                        alt={slot.name}
                        className="w-10 h-10 rounded object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center shrink-0">
                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{slot.name}</p>
                      {slot.provider && (
                        <p className="text-xs text-muted-foreground truncate">{slot.provider}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bet Size */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Bet (€)</Label>
            <Input
              placeholder="Ex: 2.00"
              type="number"
              step="0.01"
              value={betSize}
              onChange={(e) => setBetSize(e.target.value)}
              className="bg-secondary/50"
            />
          </div>

          {/* Add Button */}
          <Button 
            onClick={handleAddSlot}
            disabled={isLoading}
            className="btn-gold text-primary-foreground font-semibold h-10"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Adicionar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddSlotForm;
