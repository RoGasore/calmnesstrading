import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface SupportWidgetSettingsProps {
  onReset?: () => void;
}

export function SupportWidgetSettings({ onReset }: SupportWidgetSettingsProps) {
  const handleReset = () => {
    localStorage.removeItem('support_widgets');
    if (onReset) {
      onReset();
    }
    // Recharger la page pour appliquer les changements
    window.location.reload();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Paramètres des Widgets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>Widgets actifs</p>
          <p className="font-semibold">4 widgets configurés</p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleReset}
          className="w-full"
        >
          Réinitialiser
        </Button>
        
        <div className="text-xs text-muted-foreground">
          Cliquez sur le + pour ajouter des widgets
        </div>
      </CardContent>
    </Card>
  );
}
