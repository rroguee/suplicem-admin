"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

type SidebarContextType = {
  isExpanded: boolean;
  isMobileOpen: boolean;
  activeItem: string | null;
  openSubmenu: string | null;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setActiveItem: (item: string | null) => void;
  toggleSubmenu: (item: string) => void;
};

type SidebarHoverContextType = {
  isHovered: boolean;
  setIsHovered: (isHovered: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);
const SidebarHoverContext = createContext<SidebarHoverContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const useSidebarHover = () => {
  const context = useContext(SidebarHoverContext);
  if (!context) {
    throw new Error("useSidebarHover must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const toggleSubmenu = useCallback((item: string) => {
    setOpenSubmenu((prev) => (prev === item ? null : item));
  }, []);

  const sidebarValue = useMemo(
    () => ({
      isExpanded: isMobile ? false : isExpanded,
      isMobileOpen,
      activeItem,
      openSubmenu,
      toggleSidebar,
      toggleMobileSidebar,
      setActiveItem,
      toggleSubmenu,
    }),
    [
      isMobile,
      isExpanded,
      isMobileOpen,
      activeItem,
      openSubmenu,
      toggleSidebar,
      toggleMobileSidebar,
      toggleSubmenu,
    ]
  );

  const hoverValue = useMemo(
    () => ({
      isHovered,
      setIsHovered,
    }),
    [isHovered]
  );

  return (
    <SidebarContext.Provider value={sidebarValue}>
      <SidebarHoverContext.Provider value={hoverValue}>
        {children}
      </SidebarHoverContext.Provider>
    </SidebarContext.Provider>
  );
};
