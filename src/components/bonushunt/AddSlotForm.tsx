import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Upload, ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddSlotFormProps {
  bonusHuntId: string;
  slotsCount: number;
  onSlotAdded: () => void;
}

const AddSlotForm = ({ bonusHuntId, slotsCount, onSlotAdded }: AddSlotFormProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [slotName, setSlotName] = useState("");
  const [betSize, setBetSize] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
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

    let imageUrl: string | null = null;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    const { error } = await supabase
      .from("slots")
      .insert({
        bonus_hunt_id: bonusHuntId,
        slot_name: slotName,
        bet_size: bet,
        cost: bet, // Cost is same as bet now
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

    // Reset form
    setSlotName("");
    setBetSize("");
    setImageFile(null);
    setImagePreview(null);
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
          {/* Image Upload */}
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

          {/* Slot Name */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Nome da Slot</Label>
            <Input
              placeholder="Ex: Gates of Olympus"
              value={slotName}
              onChange={(e) => setSlotName(e.target.value)}
              className="bg-secondary/50"
            />
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
