import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TemplateOption {
  name: string;
  colorClasses: string;
}

const templates: TemplateOption[] = [
  { name: "Classic", colorClasses: "bg-gradient-to-br from-blue-500 to-indigo-600" },
  { name: "Modern", colorClasses: "bg-gradient-to-br from-slate-700 to-slate-900" },
  { name: "Vibrant", colorClasses: "bg-gradient-to-br from-amber-400 to-red-500" },
  { name: "Fresh", colorClasses: "bg-gradient-to-br from-teal-400 to-emerald-500" },
  { name: "Minimal", colorClasses: "bg-gradient-to-br from-gray-100 to-gray-300" },
];

interface CardTemplateProps {
  selectedTemplate: string;
  onSelectTemplate: (template: string) => void;
}

const CardTemplate = ({ selectedTemplate, onSelectTemplate }: CardTemplateProps) => {
  useEffect(() => {
    // Set default template if none is selected
    if (!selectedTemplate && templates.length > 0) {
      onSelectTemplate(templates[0].name);
    }
  }, [selectedTemplate, onSelectTemplate]);

  return (
    <Card>
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-medium text-slate-800">Templates</h3>
        <a href="#" className="text-primary-600 text-sm font-medium">View All</a>
      </div>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {templates.map((template) => (
            <div 
              key={template.name}
              className="relative cursor-pointer group"
              onClick={() => onSelectTemplate(template.name)}
            >
              <div className={cn(
                "h-20 rounded-md overflow-hidden",
                template.name === selectedTemplate 
                  ? "border-2 border-primary-500" 
                  : "border-2 border-transparent group-hover:border-primary-500"
              )}>
                <div className={template.colorClasses + " h-full"}></div>
              </div>
              <div className="text-xs mt-1 text-center text-slate-600">{template.name}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CardTemplate;
