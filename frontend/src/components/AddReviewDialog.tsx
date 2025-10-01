import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface AddReviewDialogProps {
  onReviewAdded: (review: any) => void;
}

const AddReviewDialog = ({ onReviewAdded }: AddReviewDialogProps) => {
  const { user, isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      toast({
        title: t('error'),
        description: t('login.required'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Simuler un délai d'envoi
    setTimeout(() => {
      const newReview = {
        id: Date.now(),
        name: user.name,
    avatar: user.avatar || "/logo.png",
        rating: rating,
        date: new Date().toISOString().split('T')[0],
        review: {
          fr: reviewText,
          en: reviewText
        }
      };

      onReviewAdded(newReview);
      
      toast({
        title: t('success.title'),
        description: t('success'),
      });

      setIsOpen(false);
      setRating(5);
      setReviewText("");
      setLoading(false);
    }, 1000);
  };

  if (!isAuthenticated) {
    return (
      <Button 
        size="lg" 
        onClick={() => toast({
          title: t('login.connection.required'),
          description: t('login.required'),
          variant: "destructive",
        })}
      >
        {t('add.review')}
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          {t('add.review')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('add.review')}</DialogTitle>
          <DialogDescription>
            {t('add.review.desc')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('rating.label')}</Label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 cursor-pointer transition-colors ${
                    i < rating 
                      ? "fill-primary text-primary" 
                      : "fill-muted text-muted-foreground hover:fill-primary/50 hover:text-primary/50"
                  }`}
                  onClick={() => setRating(i + 1)}
                />
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="review">{t('review.label')}</Label>
            <Textarea
              id="review"
              placeholder={t('review.placeholder')}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              required
              rows={4}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading || !reviewText.trim()}>
              {loading ? "..." : t('submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddReviewDialog;