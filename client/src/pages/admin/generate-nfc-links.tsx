import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Download, Plus, Printer, QrCode } from "lucide-react";
import { nanoid } from "nanoid";
import { PublicLink } from "@shared/schema";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function GenerateNfcLinks() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [numLinks, setNumLinks] = useState(10);
  const [prefix, setPrefix] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [generatedLinks, setGeneratedLinks] = useState<string[]>([]);

  // Query to get all unassigned pre-generated links
  const { data: unassignedLinks = [] } = useQuery<PublicLink[]>({
    queryKey: ['/api/admin/unassigned-links'],
    queryFn: async () => {
      const res = await fetch('/api/admin/unassigned-links');
      if (!res.ok) {
        throw new Error('Failed to fetch unassigned links');
      }
      return res.json();
    }
  });

  // Query to get template cards
  const { data: templateCards = [] } = useQuery({
    queryKey: ['/api/admin/template-cards'],
    queryFn: async () => {
      const res = await fetch('/api/admin/template-cards');
      if (!res.ok) {
        throw new Error('Failed to fetch template cards');
      }
      return res.json();
    }
  });

  // Mutation to generate pre-defined links
  const generateLinksMutation = useMutation({
    mutationFn: async (data: { count: number, prefix: string, templateId?: number }) => {
      const res = await apiRequest("POST", "/api/admin/generate-links", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to generate links');
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data && data.slugs && Array.isArray(data.slugs)) {
        setGeneratedLinks(data.slugs);
        toast({
          title: "Links Generated",
          description: `Successfully generated ${data.slugs.length} new NFC card links.`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/unassigned-links'] });
      } else {
        toast({
          title: "Warning",
          description: "Unexpected response format from server",
          variant: "destructive",
        });
      }
      setIsGenerating(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  });

  // Function to generate new links
  const handleGenerateLinks = () => {
    setIsGenerating(true);
    const templateId = selectedTemplateId && selectedTemplateId !== 'none' && 
                       selectedTemplateId !== 'no-templates' ? 
                       parseInt(selectedTemplateId) : undefined;
    
    generateLinksMutation.mutate({
      count: numLinks,
      prefix,
      templateId
    });
  };

  // Function to copy all links to clipboard
  const copyAllLinks = () => {
    const baseUrl = window.location.origin;
    const linksText = generatedLinks.map(slug => `${baseUrl}/card/${slug}`).join('\n');
    navigator.clipboard.writeText(linksText);
    
    toast({
      title: "Links Copied",
      description: "All links have been copied to your clipboard.",
    });
  };

  // Function to export links as CSV
  const exportAsCSV = () => {
    const baseUrl = window.location.origin;
    const csvContent = [
      "Number,Slug,Full URL",
      ...generatedLinks.map((slug, index) => 
        `${index + 1},"${slug}","${baseUrl}/card/${slug}"`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `nfc-links-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Generate NFC Card Links</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Links</CardTitle>
              <CardDescription>
                Create pre-defined links for NFC business cards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="num-links">Number of Links</Label>
                <Input 
                  id="num-links" 
                  type="number" 
                  min="1" 
                  max="1000" 
                  value={numLinks} 
                  onChange={e => setNumLinks(Number(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prefix">Link Prefix (Optional)</Label>
                <Input 
                  id="prefix" 
                  placeholder="e.g., conf2023" 
                  value={prefix} 
                  onChange={e => setPrefix(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  If provided, links will look like: prefix-randomchars
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template">Card Template (Optional)</Label>
                <Select 
                  value={selectedTemplateId}
                  onValueChange={setSelectedTemplateId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No template</SelectItem>
                    {templateCards && templateCards.length > 0 ? (
                      templateCards.map((template: any) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.templateName || `Template ${template.id}`}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-templates">No templates available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Specify a template to pre-configure the card design
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleGenerateLinks} 
                disabled={generateLinksMutation.isPending || numLinks < 1}
                className="w-full"
              >
                {generateLinksMutation.isPending ? "Generating..." : "Generate Links"}
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Active Unassigned Links</CardTitle>
              <CardDescription>
                Links ready to be printed on NFC cards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{unassignedLinks.length}</p>
              <p className="text-sm text-muted-foreground">
                Pre-generated links waiting to be claimed
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {generatedLinks.length > 0 ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Generated Links</CardTitle>
                  <CardDescription>
                    {generatedLinks.length} links were successfully generated
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={copyAllLinks} title="Copy all links">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={exportAsCSV} title="Export as CSV">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-[500px] overflow-y-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>URL</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generatedLinks.map((slug, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{slug}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {window.location.origin}/card/{slug}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="justify-end space-x-2">
                <Button variant="outline" onClick={exportAsCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button variant="outline">
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button variant="outline">
                  <QrCode className="mr-2 h-4 w-4" />
                  Generate QR Codes
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-xl mb-2">No Links Generated Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Generate pre-defined links for your NFC business cards. These links will be ready for users to claim and customize after scanning their physical cards.
                </p>
                <Button onClick={handleGenerateLinks}>
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Links
                </Button>
              </CardContent>
            </Card>
          )}

          {unassignedLinks.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Unassigned Links</CardTitle>
                <CardDescription>
                  Links that have been pre-generated but not yet claimed by users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-[300px] overflow-y-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unassignedLinks.map((link, index) => (
                        <TableRow key={link.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{link.uniqueSlug}</TableCell>
                          <TableCell>{new Date(link.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                              Unclaimed
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}