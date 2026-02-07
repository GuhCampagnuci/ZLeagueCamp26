
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Users, Calendar, Sword, ClipboardList, BookOpen, BarChart3, History } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Início', icon: Trophy },
    { path: '/squads', label: 'Elencos', icon: Users },
    { path: '/availability', label: 'Agenda', icon: Calendar },
    { path: '/challenges', label: 'Desafios', icon: Sword },
    { path: '/history', label: 'Histórico', icon: History },
    { path: '/report', label: 'Reportar', icon: ClipboardList },
    { path: '/statistics', label: 'Stats', icon: BarChart3 },
    { path: '/rules', label: 'Regras', icon: BookOpen },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800 lg:top-0 lg:bottom-auto lg:border-t-0 lg:border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="hidden lg:flex items-center gap-2">
            <div className="w-8 h-8 ea-gradient rounded-lg flex items-center justify-center font-bold text-white italic">Z</div>
            <span className="font-heading font-bold text-xl tracking-tight text-white italic uppercase">Z LEAGUE</span>
          </Link>
          
          <div className="flex flex-1 justify-around lg:justify-end lg:gap-4 xl:gap-6 items-center h-full">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col lg:flex-row items-center gap-1 lg:gap-2 px-2 py-1 rounded-md transition-colors ${
                  isActive(item.path) 
                    ? 'text-blue-500' 
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                <item.icon size={16} />
                <span className="text-[8px] lg:text-xs font-medium uppercase tracking-tighter">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
