import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RiPencilLine } from "react-icons/ri";

interface FileUploadProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

const FileUpload = ({ value, onChange, className }: FileUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file size (max 1MB)
    if (file.size > 1024 * 1024) {
      alert("File size must be less than 1MB");
      return;
    }
    
    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      alert("File must be JPG, PNG, or GIF");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreviewUrl(result);
      onChange(result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center">
        <div className="relative">
          <Avatar className="w-16 h-16">
            <AvatarImage 
              src={previewUrl} 
              alt="Profile" 
              className="object-cover"
            />
            <AvatarFallback>
              {/* Show initials or placeholder */}
              <span className="text-xl">U</span>
            </AvatarFallback>
          </Avatar>
          <button 
            type="button" 
            className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md border border-slate-200"
            onClick={handleButtonClick}
          >
            <RiPencilLine className="text-slate-500 text-sm" />
          </button>
        </div>
        <div className="ml-5">
          <Button
            type="button"
            variant="outline"
            onClick={handleButtonClick}
            className="bg-white border border-slate-300 rounded-md text-sm font-medium py-1.5 px-3 text-slate-700 hover:bg-slate-50"
          >
            Change Photo
          </Button>
          <p className="mt-1 text-xs text-slate-500">JPG, PNG or GIF. 1MB max.</p>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default FileUpload;
