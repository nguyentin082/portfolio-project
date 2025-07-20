"use client"

import type React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { PlaygroundSidebar } from "@/components/playground-sidebar"
import { useAuth } from "@/components/auth-provider"

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()

  /* --------------------------------------------
     Always mount SidebarProvider so useSidebar()
     has a context. Only show the visual sidebar
     when the user is authenticated.
  ---------------------------------------------*/
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {user && <PlaygroundSidebar />}
        {/* Even when the sidebar is absent, SidebarInset can
            safely render the main area at full width. */}
        <SidebarInset className="flex-1 min-w-0">{children}</SidebarInset>
      </div>
    </SidebarProvider>
  )
}
