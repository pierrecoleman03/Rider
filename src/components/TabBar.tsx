"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBowl, IconCard, IconFriends, IconPin } from "./Icons";

const TABS = [
  { href: "/", label: "Rider", Icon: IconCard, also: undefined as string[] | undefined },
  { href: "/rooms", label: "Rooms", Icon: IconBowl, also: ["/tasting", "/room"] },
  { href: "/friends", label: "Friends", Icon: IconFriends },
  { href: "/places", label: "Places", Icon: IconPin },
];

export function TabBar() {
  const path = usePathname();
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map(({ href, label, Icon, also }) => (
        <Link key={href} href={href} className="tab" aria-current={path === href || also?.some((a) => path.startsWith(a)) ? "page" : undefined}>
          <Icon />
          {label}
        </Link>
      ))}
    </nav>
  );
}
