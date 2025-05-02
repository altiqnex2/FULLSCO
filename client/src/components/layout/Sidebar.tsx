import { Link, useLocation } from "wouter";
import { t } from "@/lib/i18n";
import {
  Home,
  FileEdit,
  FolderClosed,
  MessageSquare,
  User,
  Settings,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const [location] = useLocation();

  // Helper function to determine if a link is active
  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const sidebarClass = isOpen
    ? "block fixed inset-0 z-40 w-64 border-l border-gray-200 bg-white lg:relative lg:inset-auto"
    : "hidden lg:block w-64 border-l border-gray-200 bg-white";

  return (
    <aside className={sidebarClass}>
      <div className="h-full px-3 py-4 overflow-y-auto">
        <ul className="space-y-2">
          <li>
            <Link href="/">
              <a
                className={`flex items-center p-2 text-base font-medium rounded-lg hover:bg-gray-100 ${
                  isActive("/")
                    ? "text-primary"
                    : "text-gray-900"
                }`}
              >
                <Home
                  className={`w-6 h-6 transition duration-75 ${
                    isActive("/")
                      ? "text-primary"
                      : "text-gray-500"
                  }`}
                />
                <span className="mr-3">{t("home")}</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/posts">
              <a
                className={`flex items-center p-2 text-base font-medium rounded-lg hover:bg-gray-100 ${
                  isActive("/posts")
                    ? "text-primary"
                    : "text-gray-900"
                }`}
              >
                <FileEdit
                  className={`w-6 h-6 transition duration-75 ${
                    isActive("/posts")
                      ? "text-primary"
                      : "text-gray-500"
                  }`}
                />
                <span className="mr-3">{t("posts")}</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/categories">
              <a
                className={`flex items-center p-2 text-base font-medium rounded-lg hover:bg-gray-100 ${
                  isActive("/categories")
                    ? "text-primary"
                    : "text-gray-900"
                }`}
              >
                <FolderClosed
                  className={`w-6 h-6 transition duration-75 ${
                    isActive("/categories")
                      ? "text-primary"
                      : "text-gray-500"
                  }`}
                />
                <span className="mr-3">{t("categories")}</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/comments">
              <a
                className={`flex items-center p-2 text-base font-medium rounded-lg hover:bg-gray-100 ${
                  isActive("/comments")
                    ? "text-primary"
                    : "text-gray-900"
                }`}
              >
                <MessageSquare
                  className={`w-6 h-6 transition duration-75 ${
                    isActive("/comments")
                      ? "text-primary"
                      : "text-gray-500"
                  }`}
                />
                <span className="mr-3">{t("comments")}</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/profile">
              <a
                className={`flex items-center p-2 text-base font-medium rounded-lg hover:bg-gray-100 ${
                  isActive("/profile")
                    ? "text-primary"
                    : "text-gray-900"
                }`}
              >
                <User
                  className={`w-6 h-6 transition duration-75 ${
                    isActive("/profile")
                      ? "text-primary"
                      : "text-gray-500"
                  }`}
                />
                <span className="mr-3">{t("profile")}</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/settings">
              <a
                className={`flex items-center p-2 text-base font-medium rounded-lg hover:bg-gray-100 ${
                  isActive("/settings")
                    ? "text-primary"
                    : "text-gray-900"
                }`}
              >
                <Settings
                  className={`w-6 h-6 transition duration-75 ${
                    isActive("/settings")
                      ? "text-primary"
                      : "text-gray-500"
                  }`}
                />
                <span className="mr-3">{t("settings")}</span>
              </a>
            </Link>
          </li>
        </ul>
        <div className="pt-5 mt-5 border-t border-gray-200">
          <button className="w-full flex items-center p-2 text-base font-medium text-gray-900 rounded-lg hover:bg-gray-100">
            <LogOut className="w-6 h-6 text-gray-500 transition duration-75" />
            <span className="mr-3">{t("logout")}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
