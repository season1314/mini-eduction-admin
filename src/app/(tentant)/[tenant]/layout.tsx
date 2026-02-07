// app/(dashboard)/[tenantKey]/layout.tsx
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/src/components/sidebar"

export default async function TenantLayout({ children, params }: { children: React.ReactNode, params: Promise<{ tenant: string }> }) {
    const resolvedParams = await params;
    const tenant = resolvedParams.tenant;
    return (
        <SidebarProvider>
            <div className="flex h-screen w-full">
                <AppSidebar tenant={tenant} />
                <main className="flex-1 overflow-y-auto bg-background">
                    <header className="flex h-16 items-center gap-4 border-b px-6">
                        <SidebarTrigger />
                        <div className="h-4 w-px bg-border" />
                        <h1 className="text-sm font-medium text-muted-foreground">{tenant}</h1>
                    </header>
                    <div className="p-6">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    )
}