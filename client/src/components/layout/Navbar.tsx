import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";

interface NavbarProps {
  onToggleSidebar: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              id="sidebar-toggle"
              className="p-2 rounded-md text-gray-500 lg:hidden"
              onClick={onToggleSidebar}
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              </svg>
            </button>
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <a className="text-xl font-bold text-primary">FULLSCO</a>
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="mr-3 relative">
              <div>
                <button
                  type="button"
                  className="bg-white p-1 rounded-full text-gray-500 hover:text-gray-600 focus:outline-none"
                >
                  <Bell className="w-6 h-6" />
                </button>
              </div>
            </div>
            {/* Profile dropdown */}
            <div className="mr-3 relative">
              <div>
                <button
                  id="user-menu"
                  type="button"
                  className="flex items-center text-sm rounded-full focus:outline-none"
                >
                  <span className="sr-only">افتح قائمة المستخدم</span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                      alt="صورة المستخدم" 
                    />
                    <AvatarFallback>أح</AvatarFallback>
                  </Avatar>
                  <span className="mr-2 font-medium">أحمد العلي</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
