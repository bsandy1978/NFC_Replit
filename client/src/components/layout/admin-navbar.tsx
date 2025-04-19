import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  CreditCard,
  Link as LinkIcon,
  Nfc,
  Home,
  Settings
} from "lucide-react";

const AdminNavbar = () => {
  const [location] = useLocation();
  
  // Menu items with their icons and paths
  const menuItems = [
    { name: "Dashboard", icon: <BarChart3 className="h-5 w-5" />, path: "/admin" },
    { name: "Users", icon: <Users className="h-5 w-5" />, path: "/admin/users" },
    { name: "Cards", icon: <CreditCard className="h-5 w-5" />, path: "/admin/cards" },
    { name: "Public Links", icon: <LinkIcon className="h-5 w-5" />, path: "/admin/links" },
    { name: "NFC Cards", icon: <Nfc className="h-5 w-5" />, path: "/admin/nfc-links" },
  ];
  
  return (
    <div className="bg-white shadow-sm border-b border-r border-slate-200 w-64 fixed h-full left-0 top-16 hidden lg:block">
      <div className="p-4">
        <h2 className="font-semibold text-lg text-slate-800 mb-4">Admin Portal</h2>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md group ${
                location === item.path
                  ? "bg-primary-50 text-primary-700"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className={`mr-3 ${
                location === item.path
                  ? "text-primary-500"
                  : "text-slate-500 group-hover:text-slate-600"
              }`}>
                {item.icon}
              </span>
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="absolute bottom-0 w-full p-4 border-t border-slate-200">
        <div className="flex flex-col space-y-2">
          <Button variant="outline" size="sm" className="justify-start" asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Back to Main Site
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="justify-start" asChild>
            <Link href="/admin/settings">
              <Settings className="h-4 w-4 mr-2" />
              Admin Settings
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar;