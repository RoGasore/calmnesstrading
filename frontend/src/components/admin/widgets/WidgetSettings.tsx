import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Settings, RotateCcw, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WidgetSettingsProps {
  onReset: () => void;
}

export function WidgetSettings({ onReset }: WidgetSettingsProps) {
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleReset = () => {
    localStorage.removeItem('admin_widgets');
    onReset();
    setResetDialogOpen(false);
    
    toast({
      title: "Widgets réinitialisés",
      description: "Vos widgets ont été remis à zéro avec la configuration par défaut.",
    });
  };

  const widgetCount = useMemo(() => {
    const savedWidgets = localStorage.getItem('admin_widgets');
    if (savedWidgets) {
      return JSON.parse(savedWidgets).length;
    }
    return 4; // Widgets par défaut
  }, []);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Paramètres des Widgets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Widgets actifs</p>
              <p className="text-sm text-muted-foreground">
                {widgetCount} widgets configurés
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResetDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Réinitialiser
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>• Cliquez sur le <strong>+</strong> pour ajouter des widgets</p>
            <p>• Survolez un widget et cliquez sur <strong>×</strong> pour le supprimer</p>
            <p>• Vos préférences sont sauvegardées automatiquement</p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Réinitialiser les widgets</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir réinitialiser tous vos widgets ? 
              Cette action remettra la configuration par défaut et supprimera vos personnalisations.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              <Trash2 className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
