import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Loader2, 
  Trash2, 
  ExternalLink, 
  Copy 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PublicLink } from "@shared/schema";

export default function AdminLinks() {
  const { toast } = useToast();
  const [linkToDelete, setLinkToDelete] = useState<PublicLink | null>(null);
  
  // Fetch all public links
  const { 
    data: links, 
    isLoading 
  } = useQuery<PublicLink[]>({
    queryKey: ["/api/admin/public-links"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Toggle link active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/public-links/${id}`, { isActive });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update link status");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Link updated",
        description: "The link status has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/public-links"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete link mutation
  const deleteLinkMutation = useMutation({
    mutationFn: async (linkId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/public-links/${linkId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete public link");
      }
      return res;
    },
    onSuccess: () => {
      toast({
        title: "Public link deleted",
        description: "The public link has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/public-links"] });
      setLinkToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleToggleActive = (link: PublicLink) => {
    toggleActiveMutation.mutate({
      id: link.id,
      isActive: !link.isActive,
    });
  };

  const handleDeleteClick = (link: PublicLink) => {
    setLinkToDelete(link);
  };

  const confirmDelete = () => {
    if (linkToDelete) {
      deleteLinkMutation.mutate(linkToDelete.id);
    }
  };

  const cancelDelete = () => {
    setLinkToDelete(null);
  };

  const copyLinkToClipboard = (slug: string) => {
    const baseUrl = window.location.origin;
    const fullUrl = `${baseUrl}/s/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    toast({
      title: "Link copied",
      description: "The public link has been copied to clipboard",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Public Links</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Unique Slug</TableHead>
              <TableHead>Business Card</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links && links.length > 0 ? (
              links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>{link.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {link.uniqueSlug}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyLinkToClipboard(link.uniqueSlug)}
                      >
                        <Copy className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{link.businessCardId}</TableCell>
                  <TableCell>{link.viewCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={link.isActive}
                        onCheckedChange={() => handleToggleActive(link)}
                        disabled={toggleActiveMutation.isPending}
                      />
                      <Badge variant={link.isActive ? "default" : "secondary"}>
                        {link.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(link.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <a href={`/s/${link.uniqueSlug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(link)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No public links found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!linkToDelete} onOpenChange={() => !deleteLinkMutation.isPending && setLinkToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the public link with slug "{linkToDelete?.uniqueSlug}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete} disabled={deleteLinkMutation.isPending}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete} 
              disabled={deleteLinkMutation.isPending}
            >
              {deleteLinkMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}