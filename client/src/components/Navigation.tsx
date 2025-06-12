import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, Bell, Users, BarChart3, Database } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Navigation() {
  const { user } = useAuth();
  const [location] = useLocation();

  const { data: monster } = useQuery({
    queryKey: ["/api/monster/active"],
  });

  const navItems = [
    { path: "/", label: "Dashboard", icon: BarChart3 },
    { path: "/community", label: "Community", icon: Users },
    { path: "/research", label: "Research", icon: Database },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Heart className="h-8 w-8 text-primary mr-2" />
              <span className="text-xl font-bold text-gray-900">Fiber Friends</span>
            </div>
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                return (
                  <Link key={item.path} href={item.path}>
                    <a
                      className={`inline-flex items-center px-1 pt-1 pb-4 text-sm font-medium border-b-2 ${
                        isActive
                          ? "text-primary border-primary"
                          : "text-gray-600 hover:text-gray-900 border-transparent hover:border-gray-300"
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-1" />
                      {item.label}
                    </a>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
              <span className="text-accent mr-1">🪙</span>
              {user?.points || 0}
            </Badge>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-danger rounded-full"></span>
            </Button>
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8 border-2 border-monster">
                <AvatarImage src={monster?.imageUrl} alt="Monster Avatar" />
                <AvatarFallback className="bg-monster text-monster-foreground">
                  {user?.firstName?.[0] || "M"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {user?.firstName || "User"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
