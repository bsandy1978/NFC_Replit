import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BusinessCard } from "@shared/schema";
import { cn } from "@/lib/utils";
import { 
  RiMailLine, 
  RiPhoneLine, 
  RiGlobalLine, 
  RiLinkedinFill, 
  RiTwitterFill,
  RiInstagramFill,
  RiFacebookFill,
  RiGithubFill,
  RiShareForwardLine
} from "react-icons/ri";

interface CardPreviewProps {
  card: Partial<BusinessCard>;
  className?: string;
}

// Function to determine which social media icon to show
const getSocialIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'linkedin':
      return <RiLinkedinFill className="text-lg" />;
    case 'twitter':
      return <RiTwitterFill className="text-lg" />;
    case 'instagram':
      return <RiInstagramFill className="text-lg" />;
    case 'facebook':
      return <RiFacebookFill className="text-lg" />;
    case 'github':
      return <RiGithubFill className="text-lg" />;
    default:
      return <RiGlobalLine className="text-lg" />;
  }
};

// Function to get background color based on template
const getTemplateStyles = (template?: string) => {
  switch (template) {
    case 'Modern':
      return 'bg-gradient-to-br from-slate-700 to-slate-900';
    case 'Vibrant':
      return 'bg-gradient-to-br from-amber-400 to-red-500';
    case 'Fresh':
      return 'bg-gradient-to-br from-teal-400 to-emerald-500';
    case 'Minimal':
      return 'bg-gradient-to-br from-gray-100 to-gray-300';
    case 'Classic':
    default:
      return 'bg-primary-800';
  }
};

const CardPreview = ({ card, className }: CardPreviewProps) => {
  const { 
    firstName = '', 
    lastName = '', 
    jobTitle = '', 
    company = '', 
    email = '', 
    phone = '', 
    website = '',
    profileImage = '',
    socialMedia = [],
    template = 'Classic'
  } = card;

  const fullName = `${firstName} ${lastName}`.trim();
  const headerBgClass = getTemplateStyles(template);
  
  const handleShare = () => {
    // Would implement sharing functionality in a real app
    alert('Sharing functionality would be implemented here');
  };
  
  return (
    <Card className={cn("shadow-sm", className)}>
      <div className="p-3 bg-slate-50 border-b border-slate-200">
        <h3 className="font-medium text-slate-800">Live Preview</h3>
      </div>
      <CardContent className="p-5 flex justify-center">
        <div className="card-preview w-64 rounded-lg overflow-hidden shadow-lg bg-white border border-slate-200 transition-all">
          <div className={`${headerBgClass} h-16 relative`}>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
              <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt={fullName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    {firstName.charAt(0)}{lastName.charAt(0)}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="pt-8 px-4 pb-5 text-center">
            <h3 className="font-bold text-slate-900">{fullName || 'Your Name'}</h3>
            <p className="text-sm text-slate-500 font-medium">{jobTitle || 'Job Title'}</p>
            <p className="text-xs text-slate-400">{company || 'Company Name'}</p>
          </div>
          <div className="px-4 pb-4">
            <div className="flex flex-col space-y-2 text-sm">
              {email && (
                <div className="flex items-center justify-center space-x-2">
                  <RiMailLine className="text-primary-500" />
                  <span className="text-slate-600 text-xs truncate">{email}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center justify-center space-x-2">
                  <RiPhoneLine className="text-primary-500" />
                  <span className="text-slate-600 text-xs">{phone}</span>
                </div>
              )}
              {website && (
                <div className="flex items-center justify-center space-x-2">
                  <RiGlobalLine className="text-primary-500" />
                  <span className="text-slate-600 text-xs truncate">
                    {website.replace(/(^\w+:|^)\/\//, '')}
                  </span>
                </div>
              )}
            </div>
          </div>
          {socialMedia && socialMedia.length > 0 && (
            <div className="border-t border-slate-200 py-3 px-4">
              <div className="flex justify-center space-x-4">
                {socialMedia.slice(0, 4).map((social, index) => (
                  <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary-500">
                    {getSocialIcon(social.platform)}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <div className="p-4 border-t border-slate-200">
        <Button 
          className="w-full bg-primary-500 hover:bg-primary-600 text-white rounded-md py-2 text-sm font-medium transition duration-150 ease-in-out flex items-center justify-center"
          onClick={handleShare}
        >
          <RiShareForwardLine className="mr-1.5" />
          Share Card
        </Button>
      </div>
    </Card>
  );
};

export default CardPreview;
