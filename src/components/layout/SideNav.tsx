
import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight,
  Search, 
  Home, 
  Users, 
  Settings, 
  BarChart2, 
  Terminal 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SideNavProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function SideNav({ open, setOpen }: SideNavProps) {
  const { session } = useAuth();
  
  const { data: profile } = useQuery({
    queryKey: ['user-profile-sidenav', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('first_name, last_name, company')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching profile in SideNav:', error);
          return null;
        }
        
        return data;
      } catch (error) {
        console.error('Exception fetching profile in SideNav:', error);
        return null;
      }
    },
    enabled: !!session?.user?.id
  });

  const navItems = [
    { name: 'Dashboard', icon: Home, href: '/' },
    { name: 'Rank Tracking', icon: BarChart2, href: '/rank-tracking' },
    { name: 'Keywords', icon: Search, href: '/keywords' },
    { name: 'Automation', icon: Terminal, href: '/automation' },
    { name: 'Clients', icon: Users, href: '/clients' },
    { name: 'Settings', icon: Settings, href: '/settings' },
  ];

  const getInitials = () => {
    if (profile && profile.first_name && profile.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`;
    }
    return session?.user?.email?.substring(0, 2).toUpperCase() || 'AB';
  };

  const getUserName = () => {
    if (profile && profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return 'User';
  };

  const getUserEmail = () => {
    return session?.user?.email || '';
  };

  return (
    <aside 
      className={cn(
        "bg-sidebar border-r border-gray-200 transition-all duration-300 flex flex-col",
        open ? "w-64" : "w-16"
      )}
    >
      <div className="flex items-center p-4 border-b border-gray-200 h-16">
        {open ? (
          <>
            <span className="font-bold text-xl text-seo-blue">SEO Boost</span>
            <button 
              onClick={() => setOpen(false)} 
              className="ml-auto rounded-full p-1 hover:bg-gray-200"
            >
              <ChevronLeft size={18} />
            </button>
          </>
        ) : (
          <button 
            onClick={() => setOpen(true)} 
            className="mx-auto rounded-full p-1 hover:bg-gray-200"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
      <nav className="flex-1 pt-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-seo-blue rounded-md mx-2",
                  window.location.pathname === item.href && "bg-gray-100 text-seo-blue font-medium"
                )}
              >
                <item.icon size={20} />
                {open && <span className="ml-3">{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-seo-blue flex items-center justify-center text-white">
            {getInitials()}
          </div>
          {open && (
            <div className="ml-3">
              <p className="text-sm font-medium">{getUserName()}</p>
              <p className="text-xs text-gray-500">{getUserEmail()}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
