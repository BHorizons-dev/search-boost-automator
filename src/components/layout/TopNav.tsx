
import React from 'react';
import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TopNavProps {
  onMenuClick: () => void;
}

export function TopNav({ onMenuClick }: TopNavProps) {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 sticky top-0 z-10">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onMenuClick} 
        className="lg:hidden"
      >
        <Menu />
      </Button>
      <div className="flex-1 ml-4">
        <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">SEO Boost Automator</h1>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 h-2 w-2 bg-seo-orange rounded-full"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="cursor-pointer">
              <div>
                <p className="font-medium">Rank drop detected</p>
                <p className="text-sm text-muted-foreground">client1.com dropped 3 positions</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <div>
                <p className="font-medium">Keyword opportunity</p>
                <p className="text-sm text-muted-foreground">New related keywords found</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="hidden md:flex items-center">
          <div className="h-8 w-8 rounded-full bg-seo-blue text-white flex items-center justify-center">
            AB
          </div>
        </div>
      </div>
    </header>
  );
}
