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
    console.log('[UserMenu] Click - User role:', user.role, 'is_staff:', user.is_staff);
    
    // Rediriger selon le ROLE uniquement (source de vérité)
    if (user.role === 'customer_service') {
      console.log('[UserMenu] → Navigating to /support');
      navigate("/support");
    }
    else if (user.role === 'admin' || user.is_staff || user.is_superuser) {
      console.log('[UserMenu] → Navigating to /admin');
      navigate("/admin");
    }
    else {
      console.log('[UserMenu] → Navigating to /user');
      navigate("/user");
    }
  };

  return (
    <Button 
      variant="ghost" 
      className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-primary transition-all" 
      onClick={handleClick}
      title={
        user.role === 'customer_service' ? "Aller au Support" : 
        user.role === 'admin' || user.is_staff ? "Aller au Panel Admin" : 
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