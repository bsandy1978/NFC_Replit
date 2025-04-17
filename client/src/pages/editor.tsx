import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import CardForm from "@/components/card-form";
import CardPreview from "@/components/card-preview";
import CardTemplate from "@/components/card-template";
import { BusinessCard } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { getDeviceId } from "@/lib/device-id";
import { RiEyeLine, RiDownloadLine } from "react-icons/ri";

const Editor = () => {
  const params = useParams();
  const cardId = params.id ? parseInt(params.id) : undefined;
  const deviceId = getDeviceId();
  
  // State for the card data that will be used for preview
  const [cardData, setCardData] = useState<Partial<BusinessCard>>({
    deviceId,
    firstName: "",
    lastName: "",
    jobTitle: "",
    company: "",
    email: "",
    template: "Classic"
  });
  
  // Settings state
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [syncEnabled, setSyncEnabled] = useState(true);
  
  // Fetch card data by deviceId if no specific card is requested
  const { data: fetchedCard, isLoading } = useQuery({
    queryKey: cardId ? ['/api/business-cards', cardId] : ['/api/business-cards', { deviceId }],
    queryFn: async ({ queryKey }) => {
      if (typeof queryKey[1] === 'number') {
        // Fetch specific card by ID
        const response = await fetch(`/api/business-cards/${queryKey[1]}`);
        if (!response.ok) return null;
        return response.json();
      } else {
        // Fetch card by deviceId
        const response = await fetch(`/api/business-cards?deviceId=${deviceId}`);
        if (!response.ok) return null;
        return response.json();
      }
    }
  });
  
  // Update form data when fetched card changes
  useEffect(() => {
    if (fetchedCard) {
      setCardData(fetchedCard);
    }
  }, [fetchedCard]);
  
  // Handle form changes to update the preview
  const handleFormChange = (values: Partial<BusinessCard>) => {
    setCardData(current => ({
      ...current,
      ...values
    }));
  };
  
  // Handle template selection
  const handleTemplateChange = (template: string) => {
    setCardData(current => ({
      ...current,
      template
    }));
  };
  
  // Handle preview button click
  const handlePreview = () => {
    // This would open a full-screen preview in a real implementation
    window.open(`/preview/${cardId || 'new'}`, '_blank');
  };
  
  // Handle export button click
  const handleExport = () => {
    // This would generate a PDF or image in a real implementation
    alert('Export functionality would be implemented here');
  };
  
  return (
    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 px-4">
      {/* Editor Header */}
      <div className="py-6 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Business Card Editor</h1>
            <p className="mt-1 text-sm text-slate-500">Design your professional digital business card</p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <Button
              variant="outline"
              className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 flex items-center"
              onClick={handlePreview}
            >
              <RiEyeLine className="mr-1.5" />
              Preview
            </Button>
            <Button
              variant="outline"
              className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 flex items-center"
              onClick={handleExport}
            >
              <RiDownloadLine className="mr-1.5" />
              Export
            </Button>
          </div>
        </div>
      </div>
      
      {/* Editor Container */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Panel */}
        <div className="col-span-2">
          <Card className="shadow-sm">
            <Tabs defaultValue="content">
              <TabsList className="w-full border-b border-slate-200 rounded-none">
                <TabsTrigger value="content" className="py-3 px-4">Content</TabsTrigger>
                <TabsTrigger value="style" className="py-3 px-4">Style</TabsTrigger>
                <TabsTrigger value="share" className="py-3 px-4">Share</TabsTrigger>
              </TabsList>
              <TabsContent value="content" className="m-0">
                <CardForm 
                  defaultValues={cardData} 
                  onFormChange={handleFormChange}
                  autoSave={autoSaveEnabled}
                />
              </TabsContent>
              <TabsContent value="style" className="m-0">
                <div className="p-5 space-y-6">
                  <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">Card Style</h3>
                  <p className="text-sm text-slate-500">Choose a template and customize the appearance of your business card.</p>
                  {/* Style options would go here in a real implementation */}
                </div>
              </TabsContent>
              <TabsContent value="share" className="m-0">
                <div className="p-5 space-y-6">
                  <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">Share Your Card</h3>
                  <p className="text-sm text-slate-500">Generate a shareable link or QR code for your business card.</p>
                  {/* Sharing options would go here in a real implementation */}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
        
        {/* Preview Panel */}
        <div className="col-span-1 flex flex-col space-y-4">
          <div className="sticky top-20">
            {/* Card Preview */}
            <CardPreview card={cardData} />
            
            {/* Card Templates */}
            <CardTemplate 
              selectedTemplate={cardData.template || "Classic"}
              onSelectTemplate={handleTemplateChange}
            />
            
            {/* Auto-Save Settings */}
            <Card className="shadow-sm mt-4">
              <div className="p-3 bg-slate-50 border-b border-slate-200">
                <h3 className="font-medium text-slate-800">Settings</h3>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm text-slate-700">Auto-Save</div>
                    <div className="text-xs text-slate-500">Save changes automatically</div>
                  </div>
                  <Switch 
                    checked={autoSaveEnabled}
                    onCheckedChange={setAutoSaveEnabled}
                  />
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm text-slate-700">Cross-Device Sync</div>
                      <div className="text-xs text-slate-500">Keep your data in sync across devices</div>
                    </div>
                    <Switch 
                      checked={syncEnabled}
                      onCheckedChange={setSyncEnabled}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
