import { PolarHog, usePostHog } from '@/hooks/posthog'
import {
  AttachMoneyOutlined,
  CodeOutlined,
  TrendingUp,
  TuneOutlined,
} from '@mui/icons-material'
import { schemas } from '@polar-sh/client'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

export type SubRoute = {
  readonly title: string
  readonly link: string
  readonly icon?: React.ReactNode
}

export type Route = {
  readonly id: string
  readonly title: string
  readonly icon?: React.ReactElement
  readonly link: string
  readonly if: boolean | undefined
  readonly subs?: SubRoute[]
  readonly selectedExactMatchOnly?: boolean
  readonly selectedMatchFallback?: boolean
  readonly checkIsActive?: (currentPath: string) => boolean
}

export type SubRouteWithActive = SubRoute & { readonly isActive: boolean }

export type RouteWithActive = Route & {
  readonly isActive: boolean
  readonly subs?: SubRouteWithActive[]
}

const applySubRouteIsActive = (
  path: string,
  parentRoute?: Route,
): ((r: SubRoute) => SubRouteWithActive) => {
  return (r: SubRoute): SubRouteWithActive => {
    const isActive =
      r.link === path ||
      (parentRoute?.link !== r.link && path.startsWith(r.link))

    return {
      ...r,
      isActive,
    }
  }
}

const applyIsActive = (path: string): ((r: Route) => RouteWithActive) => {
  return (r: Route): RouteWithActive => {
    let isActive = false

    if (r.checkIsActive !== undefined) {
      isActive = r.checkIsActive(path)
    } else {
      // Fallback
      isActive = Boolean(path && path.startsWith(r.link))
    }

    const subs = r.subs ? r.subs.map(applySubRouteIsActive(path, r)) : undefined

    return {
      ...r,
      isActive,
      subs,
    }
  }
}

const useResolveRoutes = (
  routesResolver: (
    org?: schemas['Organization'],
    posthog?: PolarHog,
  ) => Route[],
  org?: schemas['Organization'],
  allowAll?: boolean,
): RouteWithActive[] => {
  const path = usePathname()
  const posthog = usePostHog()

  return useMemo(() => {
    return routesResolver(org, posthog)
      .filter((o) => allowAll || o.if)
      .map(applyIsActive(path))
  }, [org, path, allowAll, routesResolver, posthog])
}

export const useDashboardRoutes = (
  org?: schemas['Organization'],
  allowAll?: boolean,
): RouteWithActive[] => {
  return useResolveRoutes((org) => dashboardRoutesList(org), org, allowAll)
}

export const useGeneralRoutes = (
  org?: schemas['Organization'],
  allowAll?: boolean,
): RouteWithActive[] => {
  return useResolveRoutes((org) => generalRoutesList(org), org, allowAll)
}

export const useOrganizationRoutes = (
  org?: schemas['Organization'],
  allowAll?: boolean,
): RouteWithActive[] => {
  return useResolveRoutes(organizationRoutesList, org, allowAll)
}

export const useAccountRoutes = (): RouteWithActive[] => {
  const path = usePathname()
  return accountRoutesList()
    .filter((o) => o.if)
    .map(applyIsActive(path))
}

const generalRoutesList = (org?: schemas['Organization']): Route[] => [
  {
    id: 'billing',
    title: 'Billing',
    icon: <AttachMoneyOutlined fontSize="inherit" />,
    link: `/dashboard/${org?.slug}/billing`,
    checkIsActive: (currentRoute: string) =>
      currentRoute === `/dashboard/${org?.slug}/billing`,
    if: true,
    subs: [
      {
        title: 'Overview',
        link: `/dashboard/${org?.slug}/billing`,
      },
      {
        title: 'Products',
        link: `/dashboard/${org?.slug}/billing/products`,
      },
      {
        title: 'Sales',
        link: `/dashboard/${org?.slug}/billing/sales`,
      },
      {
        title: 'Subscriptions',
        link: `/dashboard/${org?.slug}/billing/subscriptions`,
      },
      {
        title: 'Checkout Links',
        link: `/dashboard/${org?.slug}/billing/checkout-links`,
      },
      {
        title: 'Discounts',
        link: `/dashboard/${org?.slug}/billing/discounts`,
      },
      {
        title: 'Benefits',
        link: `/dashboard/${org?.slug}/billing/benefits`,
      },
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: <TrendingUp fontSize="inherit" />,
    link: `/dashboard/${org?.slug}/analytics`,
    checkIsActive: (currentRoute: string) =>
      currentRoute === `/dashboard/${org?.slug}/analytics`,
    if: true,
    subs: [
      {
        title: 'Overview',
        link: `/dashboard/${org?.slug}/analytics`,
      },
      {
        title: 'Usage Billing',
        link: `/dashboard/${org?.slug}/analytics/usage-billing`,
      },
      {
        title: 'Benefits',
        link: `/dashboard/${org?.slug}/analytics/benefits`,
      },
    ],
  },
  {
    id: 'finance',
    title: 'Finance',
    icon: <AttachMoneyOutlined fontSize="inherit" />,
    link: `/dashboard/${org?.slug}/finance`,
    checkIsActive: (currentRoute: string) =>
      currentRoute === `/dashboard/${org?.slug}/finance`,
    if: true,
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: <TuneOutlined fontSize="inherit" />,
    link: `/dashboard/${org?.slug}/settings`,
    checkIsActive: (currentRoute: string) =>
      currentRoute === `/dashboard/${org?.slug}/settings`,
    if: true,
  },
]

// internals below

const dashboardRoutesList = (org?: schemas['Organization']): Route[] => [
  ...accountRoutesList(),
  ...generalRoutesList(org),
  ...organizationRoutesList(org),
]

const accountRoutesList = (): Route[] => [
  {
    id: 'preferences',
    title: 'Preferences',
    link: `/dashboard/account/preferences`,
    icon: <TuneOutlined className="h-5 w-5" fontSize="inherit" />,
    if: true,
    subs: undefined,
  },
  {
    id: 'developer',
    title: 'Developer',
    link: `/dashboard/account/developer`,
    icon: <CodeOutlined fontSize="inherit" />,
    if: true,
  },
]

const orgFinanceSubRoutesList = (org?: schemas['Organization']): SubRoute[] => [
  {
    title: 'Income',
    link: `/dashboard/${org?.slug}/finance/income`,
  },
  {
    title: 'Payouts',
    link: `/dashboard/${org?.slug}/finance/payouts`,
  },
  {
    title: 'Account',
    link: `/dashboard/${org?.slug}/finance/account`,
  },
]

const organizationRoutesList = (org?: schemas['Organization']): Route[] => [
  {
    id: 'finance',
    title: 'Finance',
    link: `/dashboard/${org?.slug}/finance`,
    icon: <AttachMoneyOutlined fontSize="inherit" />,
    if: true,
    subs: orgFinanceSubRoutesList(org),
  },
  {
    id: 'settings',
    title: 'Settings',
    link: `/dashboard/${org?.slug}/settings`,
    icon: <TuneOutlined fontSize="inherit" />,
    if: true,
    subs: [
      {
        title: 'General',
        link: `/dashboard/${org?.slug}/settings`,
      },
      {
        title: 'Members',
        link: `/dashboard/${org?.slug}/settings/members`,
      },
      {
        title: 'Webhooks',
        link: `/dashboard/${org?.slug}/settings/webhooks`,
      },
      {
        title: 'Custom Fields',
        link: `/dashboard/${org?.slug}/settings/custom-fields`,
      },
    ],
  },
]
