import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RiVipDiamondFill, RiMenuLine, RiCheckLine, RiRefreshLine } from "react-icons/ri";

interface AutoSaveIndicatorProps {
  status?: 'idle' | 'saving' | 'saved' | 'error';
}

const AutoSaveIndicator = ({ status = 'idle' }: AutoSaveIndicatorProps) => {
  if (status === 'idle') return null;
  
  return (
    <span className={`text-xs text-slate-500 transition-opacity ${status !== 'idle' ? 'opacity-100' : 'opacity-0'}`}>
      {status === 'saving' && (
        <>
          <RiRefreshLine className="inline mr-1 text-blue-500 animate-spin" /> Saving...
        </>
      )}
      {status === 'saved' && (
        <>
          <RiCheckLine className="inline mr-1 text-green-500" /> Saved
        </>
      )}
      {status === 'error' && (
        <span className="text-red-500">Failed to save</span>
      )}
    </span>
  );
};

const Navbar = () => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  const isEditor = location === '/editor' || location.startsWith('/editor/');
  
  // This would be connected to the actual auto-save state in a real implementation
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <RiVipDiamondFill className="text-2xl text-primary-900 mr-2" />
              <span className="font-bold text-lg text-primary-900">CardFolio</span>
            </Link>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/editor" className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${location.startsWith('/editor') ? 'border-primary-500 text-primary-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                Editor
              </Link>
              <Link href="/templates" className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${location === '/templates' ? 'border-primary-500 text-primary-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                Templates
              </Link>
              <Link href="/analytics" className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${location === '/analytics' ? 'border-primary-500 text-primary-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                Analytics
              </Link>
              <Link href="/settings" className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${location === '/settings' ? 'border-primary-500 text-primary-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                Settings
              </Link>
            </nav>
          </div>
          <div className="flex items-center">
            {isEditor && (
              <div className="hidden sm:block mx-3">
                <AutoSaveIndicator status={saveStatus} />
              </div>
            )}
            {isEditor && (
              <Button className="bg-primary-500 hover:bg-primary-600 text-white rounded-md py-2 px-4 text-sm font-medium transition duration-150 ease-in-out hidden sm:flex">
                Share Card
              </Button>
            )}
            <div className="ml-3 relative">
              <div>
                <button type="button" className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User" />
                    <AvatarFallback>User</AvatarFallback>
                  </Avatar>
                </button>
              </div>
            </div>
            <button 
              className="sm:hidden ml-2 inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none"
              onClick={toggleMobileMenu}
            >
              <RiMenuLine className="text-2xl" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`sm:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="space-y-1 px-4 pb-3 pt-2">
          <Link href="/editor" className={`block rounded-md py-2 px-3 text-base font-medium ${location.startsWith('/editor') ? 'bg-primary-50 text-primary-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}>
            Editor
          </Link>
          <Link href="/templates" className={`block rounded-md py-2 px-3 text-base font-medium ${location === '/templates' ? 'bg-primary-50 text-primary-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}>
            Templates
          </Link>
          <Link href="/analytics" className={`block rounded-md py-2 px-3 text-base font-medium ${location === '/analytics' ? 'bg-primary-50 text-primary-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}>
            Analytics
          </Link>
          <Link href="/settings" className={`block rounded-md py-2 px-3 text-base font-medium ${location === '/settings' ? 'bg-primary-50 text-primary-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}>
            Settings
          </Link>
          <div className="pt-4 pb-3 border-t border-slate-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User" />
                  <AvatarFallback>User</AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-slate-800">Alex Johnson</div>
                <div className="text-sm font-medium text-slate-500">alex@example.com</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link href="/profile" className="text-slate-500 hover:bg-slate-100 hover:text-slate-900 block rounded-md py-2 px-3 text-base font-medium">
                Your Profile
              </Link>
              <Link href="/sign-out" className="text-slate-500 hover:bg-slate-100 hover:text-slate-900 block rounded-md py-2 px-3 text-base font-medium">
                Sign out
              </Link>
              {isEditor && (
                <div className="flex items-center justify-between py-2 px-3">
                  <span className="text-base font-medium text-slate-500">Share Card</span>
                  <Button className="bg-primary-500 hover:bg-primary-600 text-white rounded-md py-1.5 px-3 text-sm font-medium transition duration-150 ease-in-out">
                    Share
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
