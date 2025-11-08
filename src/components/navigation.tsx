"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TrendingUp,
  BarChart3,
  Award,
  Users,
  FileText,
  Settings,
  Crown,
  CreditCard,
  User,
  Menu,
  X
} from "lucide-react";

interface NavigationProps {
  userRole?: 'client' | 'expert' | 'admin';
  subscriptionStatus?: 'free' | 'premium';
  creditsRemaining?: number;
}

export default function Navigation({
  userRole = 'client',
  subscriptionStatus = 'free',
  creditsRemaining = 0
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const getNavigationItems = () => {
    const baseItems = [
      {
        href: "/business-analysis",
        label: "New Analysis",
        icon: TrendingUp,
        description: "Create AI business analysis"
      },
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: BarChart3,
        description: "View your reports and stats"
      },
      {
        href: "/reports",
        label: "Reports",
        icon: FileText,
        description: "Browse all reports"
      }
    ];

    // Add expert/admin specific items
    if (userRole === 'expert' || userRole === 'admin') {
      baseItems.push({
        href: "/expert-dashboard",
        label: "Expert Dashboard",
        icon: Award,
        description: "Review and enhance reports"
      });
    }

    // Add admin specific items
    if (userRole === 'admin') {
      baseItems.push({
        href: "/admin",
        label: "Admin Panel",
        icon: Settings,
        description: "System administration"
      });
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">AI Business Consultation</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive(item.href) ? "default" : "ghost"}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side items */}
          <div className="flex items-center gap-4">
            {/* Credits display for free users */}
            {userRole === 'client' && subscriptionStatus === 'free' && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <CreditCard className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                  {creditsRemaining} credits
                </span>
              </div>
            )}

            {/* Subscription badge */}
            {subscriptionStatus === 'premium' && (
              <Badge className="hidden sm:flex bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}

            {/* User menu */}
            <SignedIn>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <UserButton />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {subscriptionStatus === 'premium' ? (
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-purple-600" />
                        Premium Member
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-yellow-600" />
                        Free Plan • {creditsRemaining} credits
                      </div>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  {subscriptionStatus === 'free' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard?tab=upgrade" className="flex items-center gap-2 text-purple-600">
                          <Crown className="h-4 w-4" />
                          Upgrade to Premium
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </SignedIn>

            <SignedOut>
              <div className="flex items-center gap-2">
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            </SignedOut>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                      isActive(item.href) ? 'bg-accent' : 'hover:bg-accent/50'
                    }`}>
                      <Icon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Mobile user info */}
            <SignedIn>
              <div className="border-t mt-4 pt-4">
                <div className="px-3 py-2">
                  {subscriptionStatus === 'premium' ? (
                    <div className="flex items-center gap-2 text-sm">
                      <Crown className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">Premium Member</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium">Free Plan • {creditsRemaining} credits</span>
                    </div>
                  )}
                </div>
                {subscriptionStatus === 'free' && (
                  <Link href="/dashboard?tab=upgrade" onClick={() => setMobileMenuOpen(false)}>
                    <div className="px-3 py-2">
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                        <Crown className="h-4 w-4 mr-2" />
                        Upgrade to Premium
                      </Button>
                    </div>
                  </Link>
                )}
              </div>
            </SignedOut>
          </div>
        )}
      </div>
    </nav>
  );
}