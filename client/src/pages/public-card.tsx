import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { BusinessCard } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  Mail, 
  Globe, 
  Share2, 
  MapPin, 
  Download, 
  ArrowLeft 
} from "lucide-react";
import { SocialMediaPlatform } from "@shared/schema";
import { FaTwitter, FaInstagram, FaLinkedin, FaFacebook, FaGithub, FaYoutube, FaPinterest, FaReddit, FaSnapchatGhost, FaTiktok } from "react-icons/fa";

const getSocialIcon = (platform: SocialMediaPlatform) => {
  switch (platform) {
    case "Twitter":
      return <FaTwitter className="h-5 w-5" />;
    case "Instagram":
      return <FaInstagram className="h-5 w-5" />;
    case "LinkedIn":
      return <FaLinkedin className="h-5 w-5" />;
    case "Facebook":
      return <FaFacebook className="h-5 w-5" />;
    case "GitHub":
      return <FaGithub className="h-5 w-5" />;
    case "YouTube":
      return <FaYoutube className="h-5 w-5" />;
    case "TikTok":
      return <FaTiktok className="h-5 w-5" />;
    case "Pinterest":
      return <FaPinterest className="h-5 w-5" />;
    case "Reddit":
      return <FaReddit className="h-5 w-5" />;
    case "Snapchat":
      return <FaSnapchatGhost className="h-5 w-5" />;
    case "Other":
      return <Globe className="h-5 w-5" />;
    default:
      return null;
  }
};

export default function PublicCardPage() {
  const [_, setLocation] = useLocation();
  const { slug } = useParams<{ slug: string }>();
  const [copied, setCopied] = useState(false);

  const { data: card, isLoading, error } = useQuery<BusinessCard>({
    queryKey: [`/api/public-links/${slug}`],
    queryFn: async () => {
      const res = await fetch(`/api/public-links/${slug}`);
      if (!res.ok) {
        throw new Error("Failed to load business card");
      }
      return res.json();
    },
  });

  const copyToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFullName = () => {
    if (!card) return "";
    const firstName = card.firstName || "";
    const lastName = card.lastName || "";
    return `${firstName} ${lastName}`.trim();
  };

  const getColorClasses = () => {
    if (!card) return "";
    
    switch (card.template) {
      case "professional":
        return "bg-zinc-900 text-white";
      case "creative":
        return "bg-gradient-to-br from-purple-600 to-pink-500 text-white";
      case "minimal":
        return "bg-white text-black border border-gray-200";
      case "corporate":
        return "bg-blue-700 text-white";
      case "elegant":
        return "bg-gradient-to-r from-gray-900 to-gray-800 text-white";
      default:
        return "bg-white text-black border border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Link not found or expired</h1>
        <p className="text-muted-foreground mb-6">This business card link may have been deleted or is no longer active.</p>
        <Button variant="outline" onClick={() => setLocation("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return Home
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <Card className={`w-full overflow-hidden shadow-lg ${getColorClasses()}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">{getFullName()}</CardTitle>
            </div>
            <p className="text-lg">{card.jobTitle}</p>
            <p className="text-sm opacity-90">{card.company}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Contact Details */}
            <div className="space-y-2">
              {card.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 opacity-70" />
                  <a href={`mailto:${card.email}`} className="hover:underline">{card.email}</a>
                </div>
              )}
              {card.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 opacity-70" />
                  <a href={`tel:${card.phone}`} className="hover:underline">{card.phone}</a>
                </div>
              )}
              {card.website && (
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2 opacity-70" />
                  <a href={card.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                    {card.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {card.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 opacity-70" />
                  <span>{card.location}</span>
                </div>
              )}
            </div>

            {/* Bio/About */}
            {card.bio && (
              <div>
                <h3 className="text-sm font-medium mb-1 opacity-70">About</h3>
                <p className="text-sm">{card.bio}</p>
              </div>
            )}

            {/* Social Media */}
            {card.socialMedia && card.socialMedia.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2 opacity-70">Connect</h3>
                <div className="flex flex-wrap gap-3">
                  {card.socialMedia.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full p-2 bg-black/10 hover:bg-black/20 transition-colors"
                      title={social.platform}
                    >
                      {getSocialIcon(social.platform)}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t border-black/10 pt-4 flex justify-between">
            <div className="text-xs opacity-70">Shared via CardFolio</div>
            <Button variant="ghost" size="sm" onClick={copyToClipboard} className="opacity-70 hover:opacity-100">
              {copied ? "Copied!" : <Share2 className="h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-8 flex justify-center">
          <Button variant="outline" onClick={() => setLocation("/")} className="mr-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={() => window.print()}>
            <Download className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}