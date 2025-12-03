"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { Nav, NavItem, NavLink } from "react-bootstrap"; 
import { RootState } from "../store";
import "./styles.css";

export default function AccountNavigation() {
  const pathname = usePathname(); 

  const { currentUser } = useSelector(
    (state: RootState) => state.accountReducer
  );

  const links = currentUser ? ["Profile"] : ["Signin", "Signup"];

  const linkToHref: Record<string, string> = {
    Signin: "/Account/Signin",
    Signup: "/Account/Signup",
    Profile: "/Account/Profile",
  };

  return (
    <Nav
      id="wd-account-navigation"
      variant="pills"
      className="flex-column"
    >
      {links.map((link) => {
        const href = linkToHref[link];
        const isActive = pathname.toLowerCase().endsWith(link.toLowerCase());
        return (
          <NavItem key={link}>
            <NavLink
              as={Link} 
              href={href}
              id={`wd-account-${link.toLowerCase()}-link`}
              active={isActive} 
            >
              {link}
            </NavLink>
          </NavItem>
        );
      })}

      {currentUser && currentUser.role === "ADMIN" && (
        <NavLink
          as={Link}
          href={`/Account/Users`}
          active={pathname.endsWith('Users')}
        >
          Users
        </NavLink>
      )}
    </Nav>
  );
}