import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Lock, CheckCircle, AlertOctagon, ArrowRight } from "lucide-react";
import CardPreview from "@/components/card-preview";
import { Link } from "wouter";

export default function ClaimNfcCard() {
  const [location, setLocation] = useLocation();
  const params = useParams();
  const { slug } = params;
  const { toast } = useToast();
  const { user, isLoading: isLoadingAuth } = useAuth();
  const [isClaiming, setIsClaiming] = useState(false);
  
  // Check public link status
  const { data: linkInfo, isLoading: isLoadingLink, error: linkError } = useQuery({
    queryKey: ['/api/nfc-links', slug],
    queryFn: async () => {
      const res = await fetch(`/api/nfc-links/${slug}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch NFC link status");
      }
      return res.json();
    },
    retry: false
  });
  
  // Mutation for claiming the NFC card
  const claimCardMutation = useMutation({
    mutationFn: async () => {
      setIsClaiming(true);
      const res = await apiRequest("POST", `/api/nfc-links/${slug}/claim`, {});
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to claim this NFC card");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Card Claimed Successfully",
        description: "You can now customize your digital business card.",
      });
      
      // Redirect to editor page
      setTimeout(() => {
        setLocation(`/editor/${data.businessCardId}`);
      }, 1500);
    },
    onError: (error: Error) => {
      setIsClaiming(false);
      toast({
        title: "Failed to Claim Card",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Determine the card status
  const isLoading = isLoadingAuth || isLoadingLink;
  const isError = linkError !== null;
  const isClaimed = linkInfo?.isClaimed;
  const isPreGenerated = linkInfo?.isPreGenerated;
  const templateCard = linkInfo?.templateCard;
  
  // Handle claim button click
  const handleClaimCard = () => {
    if (!user) {
      // Redirect to login page with return URL to come back
      setLocation(`/auth?returnTo=${encodeURIComponent(location)}`);
      return;
    }
    
    claimCardMutation.mutate();
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-3xl">
        {isLoading ? (
          <Card className="w-full shadow-md">
            <CardContent className="flex flex-col items-center justify-center p-8">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-lg font-medium">Loading card information...</p>
            </CardContent>
          </Card>
        ) : isError ? (
          <Card className="w-full shadow-md border-red-200">
            <CardHeader className="bg-red-50 border-b border-red-200">
              <CardTitle className="text-red-700 flex items-center">
                <AlertOctagon className="h-5 w-5 mr-2" />
                Error Loading Card
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 mb-4">
                We couldn't find the NFC card you're looking for. It may have been deactivated or doesn't exist.
              </p>
              <Button asChild variant="outline">
                <Link to="/">
                  Go to Homepage
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : isClaimed ? (
          <Card className="w-full shadow-md border-amber-200">
            <CardHeader className="bg-amber-50 border-b border-amber-200">
              <CardTitle className="text-amber-700 flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Card Already Claimed
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 mb-4">
                This NFC card has already been claimed by another user. If you believe this is an error, please contact support.
              </p>
              <Button asChild variant="outline">
                <Link to="/">
                  Go to Homepage
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="w-full shadow-md">
              <CardHeader>
                <CardTitle>Claim Your NFC Business Card</CardTitle>
                <CardDescription>
                  Personalize and manage your digital business profile
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 rounded-full p-1 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Available for Claiming</p>
                      <p className="text-sm text-gray-600">This card is ready to be personalized by you</p>
                    </div>
                  </div>
                  
                  {templateCard && (
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Pre-designed Template</p>
                        <p className="text-sm text-gray-600">This card comes with a professional template</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-3">
                    <div className="bg-purple-100 rounded-full p-1 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Shareable Profile</p>
                      <p className="text-sm text-gray-600">Create a digital card you can share with anyone</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 p-6 border-t">
                {!user ? (
                  <Button className="w-full" onClick={handleClaimCard}>
                    Login to Claim Card <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={handleClaimCard}
                    disabled={isClaiming}
                  >
                    {isClaiming ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Claiming Card...
                      </>
                    ) : (
                      <>
                        Claim This Card <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
            
            {templateCard && (
              <div className="hidden md:block">
                <p className="text-sm text-gray-500 mb-2">Card Preview</p>
                <CardPreview card={templateCard} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}