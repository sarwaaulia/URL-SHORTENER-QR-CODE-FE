import React from "react";

interface NavItemProps {
    icon: React.ReactNode,
    label: string,
    isOpen: boolean,
    active: boolean,
}

export const NavItem = ({ icon, label, isOpen = true, active = false }: NavItemProps) => (
  <div className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all`}>
    {icon}
    {isOpen && <span className="font-medium text-sm">{label}</span>}
  </div>
);