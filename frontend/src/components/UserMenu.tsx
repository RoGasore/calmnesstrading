import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const UserMenu = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || user.email || "Utilisateur";
  const avatarAlt = displayName;
  const avatarInitial = (displayName && displayName.charAt(0)) || "?";

  const handleClick = () => {
    // Rediriger selon le rôle : vérifier RÔLE SPÉCIFIQUE d'abord
    // 1. Service client en premier (a is_staff mais role='customer_service')
    if (user.is_customer_service || user.role === 'customer_service') {
      navigate("/support");
    }
    // 2. Admin ensuite (role='admin' ou superuser)
    else if (user.is_admin_user || user.role === 'admin' || isAdmin()) {
      navigate("/admin");
    }
    // 3. Utilisateur normal par défaut
    else {
      navigate("/user");
    }
  };

  return (
    <Button 
      variant="ghost" 
      className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-primary transition-all" 
      onClick={handleClick}
      title={
        user.is_customer_service || user.role === 'customer_service' ? "Aller au Support" : 
        user.is_admin_user || user.role === 'admin' || isAdmin() ? "Aller au Panel Admin" : 
        "Aller à Mon Espace"
      }
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={(user as any).avatar} alt={avatarAlt} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {avatarInitial}
        </AvatarFallback>
      </Avatar>
    </Button>
  );
};

export default UserMenu;