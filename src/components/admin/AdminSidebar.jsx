
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Home,
    LineChart,
    Package,
    Settings,
    Users,
    Eye,
    PhoneCall,
    CalendarCheck,
    Star,
    FileText,
    Stethoscope,
    History,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    { href: "/admin/dashboard", icon: <Home className="h-5 w-5" />, label: "Dashboard" },
    { href: "/admin/appointments", icon: <CalendarCheck className="h-5 w-5" />, label: "Appointments" },
    { href: "/admin/callbacks", icon: <PhoneCall className="h-5 w-5" />, label: "Callbacks" },
    { href: "/admin/products", icon: <Package className="h-5 w-5" />, label: "Products" },
    { href: "/admin/eyetest", icon: <FileText className="h-5 w-5" />, label: "Eye Test" },
    { href: "/admin/past-users", icon: <History className="h-5 w-5" />, label: "Past Records" },
   { href: "/admin/doctor-appointments", icon: <Stethoscope className="h-5 w-5" />, label: "Doctor's Desk" },
    { href: "/admin/users", icon: <Users className="h-5 w-5" />, label: "Users" },
    { href: "/admin/reviews", icon: <Star className="h-5 w-5" />, label: "Reviews" },
    { href: "#", icon: <LineChart className="h-5 w-5" />, label: "Analytics" },
]

export function AdminSidebar() {
    const pathname = usePathname();

    const isActive = (href) => {
       if (href === '/admin/dashboard') {
            return pathname === href;
        }
        if (href === '#') return false;
        // Ensure the path is not the dashboard and starts with the href
        return pathname.startsWith(href) && href !== '/admin/dashboard';
    }

    return (
<aside className="fixed inset-y-0 left-0 z-10 flex w-14 flex-col border-r bg-background">             <TooltipProvider>
            <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
                <Link
                    href="/"
                    className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
                >
                    <Eye className="h-4 w-4 transition-all group-hover:scale-110" />
                    <span className="sr-only">OptiCare</span>
                </Link>

                {navItems.map(item => (
                     <Tooltip key={item.label}>
                        <TooltipTrigger asChild>
                            <Link
                                href={item.href}
                                className={cn(
                                    "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                                    isActive(item.href) ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                                )}
                            >
                            {item.icon}
                            <span className="sr-only">{item.label}</span>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                ))}
            </nav>
            <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
                <Tooltip>
                    <TooltipTrigger asChild>
                    <Link
                        href="/admin/settings"
                        className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                            pathname === "/admin/settings" ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                        )}
                    >
                        <Settings className="h-5 w-5" />
                        <span className="sr-only">Settings</span>
                    </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">Settings</TooltipContent>
                </Tooltip>
            </nav>
            </TooltipProvider>
        </aside>
    )
}
