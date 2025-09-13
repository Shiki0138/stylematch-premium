"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@stylematch/ui/button"
import { Badge } from "@stylematch/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@stylematch/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@stylematch/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@stylematch/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@stylematch/ui/sheet"
import { 
  Menu, X, Sparkles, Users, Calendar, MessageCircle, 
  Settings, LogOut, User, Home, Search, Star 
} from "lucide-react"
import { ThemeToggle } from "./theme-toggle"

const navigation = [
  {
    name: "AI診断",
    href: "/diagnosis",
    description: "顔型・パーソナルカラー診断",
    icon: Sparkles,
  },
  {
    name: "美容師を探す",
    href: "/stylists",
    description: "プロの美容師を検索",
    icon: Users,
  },
  {
    name: "サービス",
    href: "#",
    description: "StyleMatchのサービス",
    children: [
      {
        name: "AI診断について",
        href: "/about/diagnosis",
        description: "AI技術による美容診断"
      },
      {
        name: "美容師紹介",
        href: "/about/stylists",
        description: "厳選された美容師"
      },
      {
        name: "料金プラン",
        href: "/pricing",
        description: "透明性のある料金設定"
      },
    ]
  }
]

export function Header() {
  const { data: session, status } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isLoading = status === "loading"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">StyleMatch</span>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Premium
            </Badge>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              {navigation.map((item) => (
                <NavigationMenuItem key={item.name}>
                  {item.children ? (
                    <>
                      <NavigationMenuTrigger>
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.name}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                          {item.children.map((child) => (
                            <li key={child.name}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={child.href}
                                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                >
                                  <div className="text-sm font-medium leading-none">
                                    {child.name}
                                  </div>
                                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                    {child.description}
                                  </p>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink asChild>
                      <Link
                        href={item.href}
                        className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                      >
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.name}
                      </Link>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <ThemeToggle />

            {/* User Menu or Auth Buttons */}
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image || ""} />
                      <AvatarFallback>
                        {session.user?.name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {session.user?.name && (
                        <p className="font-medium">{session.user.name}</p>
                      )}
                      {session.user?.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {session.user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <User className="mr-2 h-4 w-4" />
                      マイページ
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/bookings">
                      <Calendar className="mr-2 h-4 w-4" />
                      予約管理
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/messages">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      メッセージ
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites">
                      <Star className="mr-2 h-4 w-4" />
                      お気に入り
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      設定
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    ログアウト
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/signin">ログイン</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">新規登録</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="lg:hidden"
                  size="icon"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">メニューを開く</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <Link 
                      href="/" 
                      className="flex items-center gap-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-xl font-bold">StyleMatch</span>
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {navigation.map((item) => (
                      <div key={item.name}>
                        {item.children ? (
                          <div className="space-y-2">
                            <p className="font-medium text-sm text-muted-foreground px-2">
                              {item.name}
                            </p>
                            {item.children.map((child) => (
                              <Link
                                key={child.name}
                                href={child.href}
                                className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <Link
                            href={item.href}
                            className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>

                  {!session && (
                    <div className="space-y-2 pt-4 border-t">
                      <Button variant="outline" className="w-full" asChild>
                        <Link 
                          href="/auth/signin"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          ログイン
                        </Link>
                      </Button>
                      <Button className="w-full" asChild>
                        <Link 
                          href="/auth/signup"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          新規登録
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}