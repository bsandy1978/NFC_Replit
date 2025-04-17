import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RiDeleteBinLine, RiAddLine } from "react-icons/ri";
import { type SocialMedia, SocialMediaPlatformSchema } from "@shared/schema";
import { useFieldArray, useFormContext } from "react-hook-form";

const PLATFORM_OPTIONS = Object.values(SocialMediaPlatformSchema.Values);

interface SocialMediaFieldProps {
  name: string;
}

const SocialMediaField = ({ name }: SocialMediaFieldProps) => {
  const { control, register } = useFormContext();
  
  const { fields, append, remove } = useFieldArray({
    control,
    name
  });
  
  const handleAddNew = () => {
    append({ platform: "LinkedIn", url: "" });
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Social Media</h3>
        <Button 
          type="button"
          variant="ghost" 
          className="text-primary-600 hover:text-primary-500 text-sm font-medium flex items-center h-auto p-0"
          onClick={handleAddNew}
        >
          <RiAddLine className="mr-1" /> Add New
        </Button>
      </div>
      
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center">
            <Select
              defaultValue={(field as SocialMedia).platform}
              onValueChange={(value) => {
                // This is handled by the controller
              }}
            >
              <SelectTrigger className="w-32 rounded-l-md rounded-r-none">
                <SelectValue placeholder="Select platform" {...register(`${name}.${index}.platform`)} />
              </SelectTrigger>
              <SelectContent>
                {PLATFORM_OPTIONS.map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              className="flex-1 rounded-none rounded-r-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Enter profile URL"
              {...register(`${name}.${index}.url`)}
            />
            <Button
              type="button"
              variant="ghost"
              className="ml-2 text-slate-400 hover:text-slate-500 p-0 h-8 w-8"
              onClick={() => remove(index)}
            >
              <RiDeleteBinLine />
            </Button>
          </div>
        ))}
        
        {fields.length === 0 && (
          <div className="text-center py-2 text-sm text-slate-500">
            <p>No social media profiles added yet</p>
            <Button
              type="button"
              variant="ghost"
              className="text-primary-600 hover:text-primary-500 mt-1"
              onClick={handleAddNew}
            >
              Add Profile
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialMediaField;
