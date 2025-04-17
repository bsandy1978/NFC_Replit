import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { type BusinessCard } from "@shared/schema";
import { getDeviceId } from "@/lib/device-id";
import { RiPencilLine, RiShareForwardLine, RiAddLine } from "react-icons/ri";

const Home = () => {
  const deviceId = getDeviceId();
  
  // Fetch saved cards
  const { data: savedCards, isLoading } = useQuery({
    queryKey: ['/api/business-cards', { deviceId }],
    queryFn: async () => {
      const response = await fetch(`/api/business-cards?deviceId=${deviceId}`);
      if (!response.ok) {
        return [];
      }
      // If we get a single card, wrap it in an array
      const data = await response.json();
      return Array.isArray(data) ? data : data ? [data] : [];
    }
  });
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    } else {
      return `${Math.floor(diffDays / 30)} months ago`;
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 px-4">
      {/* Hero section */}
      <div className="py-12 text-center">
        <h1 className="text-4xl font-bold text-primary-900 mb-4">Digital Business Cards for Professionals</h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Create, customize, and share your digital business card. Save trees and make connections.
        </p>
        <div className="mt-8">
          <Link href="/editor">
            <Button className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-2.5 rounded-md text-lg font-medium">
              Create New Card
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Saved Cards Section */}
      <div className="mt-12 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Your Saved Cards</h2>
          <Link href="/cards" className="text-primary-600 hover:text-primary-500 font-medium text-sm flex items-center">
            View All <span className="ml-1">→</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card items */}
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={`loading-${index}`} className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200">
                <div className="bg-slate-200 h-14 animate-pulse"></div>
                <CardContent className="p-4 pt-6">
                  <div className="h-4 bg-slate-200 rounded animate-pulse mb-2 w-2/3"></div>
                  <div className="h-3 bg-slate-200 rounded animate-pulse w-1/2"></div>
                  <div className="mt-3 flex justify-between items-center">
                    <div className="h-3 bg-slate-200 rounded animate-pulse w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : savedCards && savedCards.length > 0 ? (
            // Saved cards
            savedCards.map((card: BusinessCard) => (
              <Card key={card.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200 cursor-pointer hover:shadow-md transition-shadow duration-200">
                <div className={`bg-gradient-to-r from-primary-800 to-primary-700 h-14 relative`}>
                  <div className="absolute -bottom-4 left-4">
                    <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                      {card.profileImage ? (
                        <img 
                          src={card.profileImage} 
                          alt={`${card.firstName} ${card.lastName}`} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          {card.firstName?.charAt(0) || ''}{card.lastName?.charAt(0) || ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <CardContent className="p-4 pt-6">
                  <h3 className="font-medium text-slate-900">{card.firstName} {card.lastName}</h3>
                  <p className="text-xs text-slate-500">{card.jobTitle}</p>
                  
                  <div className="mt-3 flex justify-between items-center">
                    <div className="text-xs text-slate-400">
                      Updated {formatDate(card.updatedAt.toString())}
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/editor/${card.id}`}>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                          <RiPencilLine />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                        <RiShareForwardLine />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            // Empty state
            <div className="col-span-full text-center py-8">
              <p className="text-slate-500 mb-4">You don't have any saved cards yet.</p>
              <Link href="/editor">
                <Button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Create Your First Card
                </Button>
              </Link>
            </div>
          )}
          
          {/* Create New Card button */}
          <Link href="/editor" className="block">
            <div className="border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center p-6 cursor-pointer hover:border-primary-500 transition-colors duration-200 h-full">
              <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center">
                <RiAddLine className="text-xl text-primary-500" />
              </div>
              <p className="mt-2 font-medium text-slate-600">Create New Card</p>
              <p className="text-xs text-slate-500 text-center mt-1">Design a new business card template</p>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Features section */}
      <div className="py-16 border-t border-slate-200 mt-16">
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-12">Why Choose CardFolio?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-primary-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Environmentally Friendly</h3>
            <p className="text-slate-600">Reduce paper waste by going digital with your business cards.</p>
          </div>
          <div className="text-center">
            <div className="bg-primary-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Always Updated</h3>
            <p className="text-slate-600">Change your information once and it updates everywhere.</p>
          </div>
          <div className="text-center">
            <div className="bg-primary-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Cross-Device Sync</h3>
            <p className="text-slate-600">Edit on your computer, share from your phone. Always in sync.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
