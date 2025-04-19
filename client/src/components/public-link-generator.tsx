import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { BusinessCard, PublicLink } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share, Copy, Trash, Plus, ExternalLink } from "lucide-react";
import { nanoid } from "nanoid";

interface PublicLinkGeneratorProps {
  businessCardId: number;
  links?: PublicLink[];
}

export default function PublicLinkGenerator({ businessCardId, links = [] }: PublicLinkGeneratorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [customSlug, setCustomSlug] = useState("");

  const { data: publicLinks = [] } = useQuery<PublicLink[]>({
    queryKey: [`/api/public-links/by-card/${businessCardId}`],
    queryFn: async () => {
      const res = await fetch(`/api/public-links/by-card/${businessCardId}`);
      if (!res.ok) return [];
      return await res.json();
    },
    initialData: links,
  });

  const createLinkMutation = useMutation({
    mutationFn: async (data: { businessCardId: number; uniqueSlug?: string }) => {
      const res = await apiRequest("POST", "/api/public-links", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Link created",
        description: "Your public link has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/public-links/by-card/${businessCardId}`] });
      setCustomSlug("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating link",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (linkId: number) => {
      await apiRequest("DELETE", `/api/public-links/${linkId}`);
    },
    onSuccess: () => {
      toast({
        title: "Link deleted",
        description: "Your public link has been deleted",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/public-links/by-card/${businessCardId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting link",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateRandomSlug = () => {
    setCustomSlug(nanoid(10));
  };

  const createNewLink = () => {
    createLinkMutation.mutate({
      businessCardId,
      uniqueSlug: customSlug || undefined, // If empty, the server will generate a random slug
    });
  };

  const copyToClipboard = (slug: string) => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/card/${slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Public link has been copied to clipboard",
    });
  };

  const openLink = (slug: string) => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/card/${slug}`;
    window.open(url, "_blank");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share className="h-5 w-5" />
          Public Links
        </CardTitle>
        <CardDescription>Create and manage public links to share your business card</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="slug">Custom Slug (Optional)</Label>
              <div className="flex space-x-2">
                <Input
                  id="slug"
                  placeholder="Enter a custom URL slug"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                />
                <Button variant="outline" size="icon" onClick={generateRandomSlug} title="Generate random slug">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Leave empty for an automatically generated link</p>
            </div>
          </div>

          <Button 
            onClick={createNewLink} 
            disabled={createLinkMutation.isPending} 
            className="w-full"
          >
            {createLinkMutation.isPending ? "Creating..." : "Create Public Link"}
          </Button>

          {publicLinks.length > 0 && (
            <div className="space-y-2 mt-4">
              <h3 className="text-sm font-medium">Existing Links</h3>
              <div className="border rounded-md divide-y">
                {publicLinks.map((link) => (
                  <div key={link.id} className="p-3 flex items-center justify-between">
                    <div className="truncate flex-1">
                      <p className="font-medium truncate">{link.uniqueSlug}</p>
                      <p className="text-xs text-muted-foreground">
                        Views: {link.viewCount} · Created: {new Date(link.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-2 flex-shrink-0">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => copyToClipboard(link.uniqueSlug)}
                        title="Copy link"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => openLink(link.uniqueSlug)}
                        title="Open link"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => deleteLinkMutation.mutate(link.id)}
                        disabled={deleteLinkMutation.isPending}
                        title="Delete link"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}