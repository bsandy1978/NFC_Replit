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
import { Loader2, Trash2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BusinessCard } from "@shared/schema";

export default function AdminCards() {
  const { toast } = useToast();
  const [cardToDelete, setCardToDelete] = useState<BusinessCard | null>(null);
  
  // Fetch all business cards
  const { 
    data: cards, 
    isLoading 
  } = useQuery<BusinessCard[]>({
    queryKey: ["/api/admin/business-cards"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Delete card mutation
  const deleteCardMutation = useMutation({
    mutationFn: async (cardId: number) => {
      const res = await apiRequest("DELETE", `/api/business-cards/${cardId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete business card");
      }
      return res;
    },
    onSuccess: () => {
      toast({
        title: "Business card deleted",
        description: "The business card has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/business-cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/public-links"] });
      setCardToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (card: BusinessCard) => {
    setCardToDelete(card);
  };

  const confirmDelete = () => {
    if (cardToDelete) {
      deleteCardMutation.mutate(cardToDelete.id);
    }
  };

  const cancelDelete = () => {
    setCardToDelete(null);
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
      <h1 className="text-3xl font-bold mb-6">Manage Business Cards</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cards && cards.length > 0 ? (
              cards.map((card) => (
                <TableRow key={card.id}>
                  <TableCell>{card.id}</TableCell>
                  <TableCell>{card.name || "Untitled"}</TableCell>
                  <TableCell>{card.jobTitle || "-"}</TableCell>
                  <TableCell>{card.company || "-"}</TableCell>
                  <TableCell>{card.userId || "Guest"}</TableCell>
                  <TableCell>
                    {new Date(card.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(card.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <a href={`/editor/${card.id}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(card)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  No business cards found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!cardToDelete} onOpenChange={() => !deleteCardMutation.isPending && setCardToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the business card "{cardToDelete?.name || 'Untitled'}"? 
              This action cannot be undone.
              All public links associated with this card will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete} disabled={deleteCardMutation.isPending}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete} 
              disabled={deleteCardMutation.isPending}
            >
              {deleteCardMutation.isPending ? (
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