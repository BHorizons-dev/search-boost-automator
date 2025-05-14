
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import type { TablesSelect } from "@/integrations/supabase/client";

interface TopNavProps {
  onMenuClick?: () => void;
}

type UserProfile = TablesSelect['user_profiles'];

export function TopNav({ onMenuClick }: TopNavProps) {
  const { session, signOut } = useAuth();
  const [profileDebugInfo, setProfileDebugInfo] = React.useState<string | null>(null);
  
  const { data: profile } = useQuery<UserProfile | null>({
    queryKey: ['user-profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      try {
        console.log('Fetching user profile for ID:', session.user.id);
        
        // Explicitly setting schema in the query to avoid schema issues
        const { data, error } = await supabase
          .from('user_profiles')
          .select('first_name, last_name, company')
          .eq('id', session.user.id as any)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching profile:', error);
          // Don't throw here, we'll fall back to email display
          if (error.code === 'PGRST106') {
            setProfileDebugInfo(`Schema error: ${error.message}`);
            toast({
              title: "Profile data unavailable",
              description: "Using email as display name instead.",
              variant: "default"
            });
          }
          return null;
        }
        
        console.log('Profile data:', data);
        return data as UserProfile;
      } catch (error) {
        console.error('Exception fetching profile:', error);
        setProfileDebugInfo(`Exception: ${(error as Error).message}`);
        return null;
      }
    },
    enabled: !!session?.user?.id,
    retry: 1,
    staleTime: 300000 // 5 minutes
  });

  const getInitials = () => {
    if (profile && profile.first_name && profile.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`;
    }
    return session?.user?.email?.substring(0, 2).toUpperCase() || 'U';
  };

  const getUserName = () => {
    if (profile && profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return session?.user?.email || 'User';
  };

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center justify-between w-full">
          {onMenuClick && (
            <Button variant="ghost" size="icon" onClick={onMenuClick} className="mr-2">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <div className="font-semibold">SEO Boost Automator</div>

          <div className="flex items-center">
            {profileDebugInfo && (
              <div className="text-xs text-amber-600 mr-2">
                {profileDebugInfo}
              </div>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{getUserName()}</p>
                    <p className="text-sm text-muted-foreground">
                      {session?.user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => signOut()}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
