'use client';

import { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    Edit2,
    Bot,
    Home,
    LogOut,
    Moon,
    Sun,
    PanelLeft,
    PanelLeftClose,
    Loader2,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
    useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import { Input } from '@/components/ui/input';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    usePlaygrounds,
    useCreatePlayground,
    useUpdatePlayground,
    useDeletePlayground,
    CreatePlaygroundDto,
} from '@/apis/playgrounds/playgrounds.api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Brain } from 'lucide-react';
import { DomainEnum } from '@/types/enum';

interface PlaygroundSession {
    id: string;
    title: string;
    domainName: DomainEnum;
    createdAt: Date;
    lastUsed: Date;
}

const domains = [
    {
        id: DomainEnum.FACE_RECOGNITION,
        name: 'Face Recognition AI',
        description: 'Detect and recognize faces in images',
        icon: Eye,
        category: 'Computer Vision',
    },
    {
        id: DomainEnum.VEXERE_ASSISTANT,
        name: 'Vexere Assistant Chatbot',
        description: 'Travel booking and customer support chatbot',
        icon: Bot,
        category: 'NLP',
    },
];

export function PlaygroundSidebar() {
    const { theme, setTheme } = useTheme();
    const { user, signOut } = useAuth();
    const router = useRouter();
    const { state, toggleSidebar } = useSidebar();
    const { toast } = useToast();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPlaygroundModel, setNewPlaygroundModel] = useState<
        DomainEnum | ''
    >('');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [playgroundToDelete, setPlaygroundToDelete] = useState<string | null>(
        null
    );

    // React Query hooks
    const {
        data: playgroundsData,
        isLoading: playgroundsLoading,
        refetch: refetchPlaygrounds,
    } = usePlaygrounds();
    const createPlaygroundMutation = useCreatePlayground();
    const updatePlaygroundMutation = useUpdatePlayground();
    const deletePlaygroundMutation = useDeletePlayground();

    const isCollapsed = state === 'collapsed';

    // Convert API data to PlaygroundSession format
    const sessions: PlaygroundSession[] = playgroundsData?.success
        ? playgroundsData.data.map((playground) => ({
              id: playground.id,
              title: playground.name,
              domainName: playground.domainName,
              createdAt: new Date(playground.createdAt),
              lastUsed: new Date(playground.updatedAt),
          }))
        : [];

    const createNewPlayground = async (domainName: DomainEnum) => {
        try {
            const domain = domains.find((d) => d.id === domainName);
            const domainDisplayName = domain?.name || 'New';

            // Use React Query mutation to create playground
            const result = await createPlaygroundMutation.mutateAsync({
                name: `${domainDisplayName} Playground`,
                domainName: domainName,
            });

            setShowCreateModal(false);
            setNewPlaygroundModel('');

            toast({
                title: 'Playground Created',
                description: `${domainDisplayName} playground created successfully!`,
            });

            // Navigate to the new playground
            if (result.success) {
                router.push(`/playground?session=${result.data.id}`);
            }

            // Refetch to get updated list
            refetchPlaygrounds();
        } catch (error) {
            console.error('Failed to create playground:', error);
            toast({
                title: 'Error',
                description: 'Failed to create playground. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const showDeleteConfirm = (sessionId: string) => {
        setPlaygroundToDelete(sessionId);
        setDeleteConfirmOpen(true);
    };

    const deleteSession = async () => {
        if (!playgroundToDelete) return;

        try {
            await deletePlaygroundMutation.mutateAsync(playgroundToDelete);
            toast({
                title: 'Success',
                description: 'Playground deleted successfully',
            });
        } catch (error: any) {
            console.error('Failed to delete playground:', error);
            toast({
                title: 'Error',
                description:
                    error?.response?.data?.error ||
                    'Failed to delete playground',
                variant: 'destructive',
            });
        } finally {
            setDeleteConfirmOpen(false);
            setPlaygroundToDelete(null);
        }
    };

    const startEditing = (session: PlaygroundSession) => {
        setEditingId(session.id);
        setEditTitle(session.title);
    };

    const saveEdit = async (id: string) => {
        if (!editTitle.trim()) {
            toast({
                title: 'Error',
                description: 'Playground name cannot be empty',
                variant: 'destructive',
            });
            return;
        }

        try {
            await updatePlaygroundMutation.mutateAsync({
                id,
                data: { name: editTitle.trim() },
            });
            setEditingId(null);
            setEditTitle('');
            toast({
                title: 'Success',
                description: 'Playground name updated successfully',
            });
        } catch (error: any) {
            console.error('Failed to update playground:', error);
            toast({
                title: 'Error',
                description:
                    error?.response?.data?.error ||
                    'Failed to update playground name',
                variant: 'destructive',
            });
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditTitle('');
    };

    const formatDate = (date: Date) => {
        const now = new Date();
        const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
        const diffInHours = diffInMinutes / 60;

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
        if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
        return date.toLocaleDateString();
    };

    const getDomainIcon = (domainName: DomainEnum) => {
        const domain = domains.find((d) => d.id === domainName);
        return domain ? domain.icon : Bot;
    };

    return (
        <TooltipProvider delayDuration={0}>
            <Sidebar
                collapsible="icon"
                className="border-r border-border/50 transition-all duration-200 ease-linear"
                variant="sidebar"
            >
                <SidebarHeader>
                    <div className="flex items-center gap-2 px-1 py-2">
                        <Bot className="h-6 w-6 text-primary flex-shrink-0" />
                        {!isCollapsed && (
                            <>
                                <span className="font-semibold">
                                    AI Playground
                                </span>
                            </>
                        )}
                    </div>

                    {/* New Playground Button */}
                    <div className={`${isCollapsed ? 'px-0' : 'px-0'}`}>
                        <Dialog
                            open={showCreateModal}
                            onOpenChange={setShowCreateModal}
                        >
                            <DialogTrigger asChild>
                                {isCollapsed ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="icon"
                                                className="w-8 h-8 mx-auto bg-primary hover:bg-primary/90"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            <p>New Playground</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ) : (
                                    <Button className="w-full justify-start gap-2">
                                        <Plus className="h-4 w-4" />
                                        New Playground
                                    </Button>
                                )}
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>
                                        Create New Playground
                                    </DialogTitle>
                                    <DialogDescription>
                                        Choose an AI model to start
                                        experimenting with
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        {domains.map((domain) => (
                                            <Card
                                                key={domain.id}
                                                className={`cursor-pointer transition-all hover:border-primary/50 ${
                                                    newPlaygroundModel ===
                                                    domain.id
                                                        ? 'border-primary bg-primary/5'
                                                        : ''
                                                }`}
                                                onClick={() =>
                                                    setNewPlaygroundModel(
                                                        domain.id as DomainEnum
                                                    )
                                                }
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-primary/10 rounded-lg">
                                                            <domain.icon className="w-5 h-5 text-primary" />
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <h3 className="font-medium">
                                                                {domain.name}
                                                            </h3>
                                                            <p className="text-sm text-muted-foreground">
                                                                {
                                                                    domain.description
                                                                }
                                                            </p>
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                {
                                                                    domain.category
                                                                }
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 pt-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setShowCreateModal(false);
                                                setNewPlaygroundModel('');
                                            }}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={() =>
                                                newPlaygroundModel &&
                                                createNewPlayground(
                                                    newPlaygroundModel as DomainEnum
                                                )
                                            }
                                            disabled={
                                                !newPlaygroundModel ||
                                                createPlaygroundMutation.isPending
                                            }
                                            className="flex-1"
                                        >
                                            {createPlaygroundMutation.isPending ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                'Create Playground'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        {!isCollapsed && (
                            <SidebarGroupLabel>
                                Recent Sessions
                            </SidebarGroupLabel>
                        )}
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {playgroundsLoading
                                    ? !isCollapsed && (
                                          <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                                              Loading playgrounds...
                                          </div>
                                      )
                                    : sessions.length === 0
                                    ? !isCollapsed && (
                                          <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                                              No sessions yet. Create your first
                                              playground!
                                          </div>
                                      )
                                    : sessions
                                          .slice(
                                              0,
                                              isCollapsed ? 5 : sessions.length
                                          )
                                          .map((session) => {
                                              const DomainIcon = getDomainIcon(
                                                  session.domainName
                                              );
                                              return (
                                                  <SidebarMenuItem
                                                      key={session.id}
                                                  >
                                                      {isCollapsed ? (
                                                          <Tooltip>
                                                              <TooltipTrigger
                                                                  asChild
                                                              >
                                                                  <SidebarMenuButton
                                                                      asChild
                                                                      className="w-8 h-8 p-0 mx-auto"
                                                                  >
                                                                      <Link
                                                                          href={`/playground?session=${session.id}`}
                                                                      >
                                                                          <DomainIcon className="h-4 w-4" />
                                                                      </Link>
                                                                  </SidebarMenuButton>
                                                              </TooltipTrigger>
                                                              <TooltipContent side="right">
                                                                  <div>
                                                                      <p className="font-medium">
                                                                          {
                                                                              session.title
                                                                          }
                                                                      </p>
                                                                      <p className="text-xs text-muted-foreground">
                                                                          {formatDate(
                                                                              session.lastUsed
                                                                          )}
                                                                      </p>
                                                                  </div>
                                                              </TooltipContent>
                                                          </Tooltip>
                                                      ) : (
                                                          <div className="group flex items-center gap-2 w-full">
                                                              {editingId ===
                                                              session.id ? (
                                                                  <div className="flex-1 flex gap-1">
                                                                      <Input
                                                                          value={
                                                                              editTitle
                                                                          }
                                                                          onChange={(
                                                                              e
                                                                          ) =>
                                                                              setEditTitle(
                                                                                  e
                                                                                      .target
                                                                                      .value
                                                                              )
                                                                          }
                                                                          onKeyDown={(
                                                                              e
                                                                          ) => {
                                                                              if (
                                                                                  e.key ===
                                                                                  'Enter'
                                                                              )
                                                                                  saveEdit(
                                                                                      session.id
                                                                                  );
                                                                              if (
                                                                                  e.key ===
                                                                                  'Escape'
                                                                              )
                                                                                  cancelEdit();
                                                                          }}
                                                                          className="h-8 text-sm"
                                                                          autoFocus
                                                                      />
                                                                      <Button
                                                                          size="sm"
                                                                          variant="ghost"
                                                                          onClick={() =>
                                                                              saveEdit(
                                                                                  session.id
                                                                              )
                                                                          }
                                                                          disabled={
                                                                              updatePlaygroundMutation.isPending
                                                                          }
                                                                          className="h-8 w-8 p-0"
                                                                      >
                                                                          {updatePlaygroundMutation.isPending ? (
                                                                              <Loader2 className="h-3 w-3 animate-spin" />
                                                                          ) : (
                                                                              '✓'
                                                                          )}
                                                                      </Button>
                                                                  </div>
                                                              ) : (
                                                                  <>
                                                                      <SidebarMenuButton
                                                                          asChild
                                                                          className={
                                                                              isCollapsed
                                                                                  ? 'w-8 h-8 p-0 mx-auto'
                                                                                  : 'flex-1'
                                                                          }
                                                                      >
                                                                          <Link
                                                                              href={`/playground?session=${session.id}`}
                                                                          >
                                                                              <DomainIcon className="h-4 w-4" />
                                                                              {!isCollapsed && (
                                                                                  <div className="flex-1 min-w-0">
                                                                                      <div className="truncate text-sm">
                                                                                          {
                                                                                              session.title
                                                                                          }
                                                                                      </div>
                                                                                      <div className="text-xs text-muted-foreground">
                                                                                          {formatDate(
                                                                                              session.lastUsed
                                                                                          )}
                                                                                      </div>
                                                                                  </div>
                                                                              )}
                                                                          </Link>
                                                                      </SidebarMenuButton>
                                                                      <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                                                                          <Button
                                                                              size="sm"
                                                                              variant="ghost"
                                                                              onClick={() =>
                                                                                  startEditing(
                                                                                      session
                                                                                  )
                                                                              }
                                                                              disabled={
                                                                                  updatePlaygroundMutation.isPending ||
                                                                                  deletePlaygroundMutation.isPending
                                                                              }
                                                                              className="h-8 w-8 p-0"
                                                                          >
                                                                              <Edit2 className="h-3 w-3" />
                                                                          </Button>
                                                                          <Button
                                                                              size="sm"
                                                                              variant="ghost"
                                                                              onClick={() =>
                                                                                  showDeleteConfirm(
                                                                                      session.id
                                                                                  )
                                                                              }
                                                                              disabled={
                                                                                  updatePlaygroundMutation.isPending ||
                                                                                  deletePlaygroundMutation.isPending
                                                                              }
                                                                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                                          >
                                                                              {deletePlaygroundMutation.isPending &&
                                                                              playgroundToDelete ===
                                                                                  session.id ? (
                                                                                  <Loader2 className="h-3 w-3 animate-spin" />
                                                                              ) : (
                                                                                  <Trash2 className="h-3 w-3" />
                                                                              )}
                                                                          </Button>
                                                                      </div>
                                                                  </>
                                                              )}
                                                          </div>
                                                      )}
                                                  </SidebarMenuItem>
                                              );
                                          })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <SidebarSeparator />

                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        className={
                                            isCollapsed
                                                ? 'w-8 h-8 p-0 mx-auto'
                                                : ''
                                        }
                                    >
                                        <Link href="/">
                                            <Home className="h-4 w-4" />
                                            {!isCollapsed && (
                                                <span>Back to Portfolio</span>
                                            )}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={() =>
                                    setTheme(
                                        theme === 'dark' ? 'light' : 'dark'
                                    )
                                }
                                className={
                                    isCollapsed ? 'w-8 h-8 p-0 mx-auto' : ''
                                }
                            >
                                {theme === 'dark' ? (
                                    <Sun className="h-4 w-4" />
                                ) : (
                                    <Moon className="h-4 w-4" />
                                )}
                                {!isCollapsed && <span>Toggle Theme</span>}
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        {user && (
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={() => signOut()}
                                    className={
                                        isCollapsed ? 'w-8 h-8 p-0 mx-auto' : ''
                                    }
                                >
                                    <LogOut className="h-4 w-4" />
                                    {!isCollapsed && <span>Sign Out</span>}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                    </SidebarMenu>
                    {user && !isCollapsed && (
                        <div className="px-2 py-2 text-sm text-muted-foreground border-t border-border/50 truncate">
                            {user.email}
                        </div>
                    )}
                </SidebarFooter>
            </Sidebar>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Playground</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this playground?
                            This action cannot be undone and will permanently
                            remove all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => {
                                setDeleteConfirmOpen(false);
                                setPlaygroundToDelete(null);
                            }}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={deleteSession}
                            disabled={deletePlaygroundMutation.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deletePlaygroundMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </TooltipProvider>
    );
}
