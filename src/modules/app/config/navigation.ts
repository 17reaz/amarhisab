import {
  BarChart3,
  Building2,
  Home,
  Receipt,
  Settings,
  UserRound,
  Users,
} from "lucide-react"

export const mainNavigation = [
  {
    label: "Home",
    href: "/app",
    icon: Home,
  },
  {
    label: "Transactions",
    href: "/app/transactions",
    icon: Receipt,
  },
  {
    label: "Parties",
    href: "/app/parties",
    icon: Users,
  },
] as const

export const moreNavigation = [
  {
    label: "Agents",
    href: "/app/agents",
    icon: Users,
  },
  {
    label: "Agencies",
    href: "/app/agencies",
    icon: Building2,
  },
  {
    label: "Reports",
    href: "/app/reports",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/app/settings",
    icon: Settings,
  },
  {
    label: "Profile",
    href: "/app/profile",
    icon: UserRound,
  },
] as const

export const allNavigation = [
  ...mainNavigation,
  ...moreNavigation,
] as const