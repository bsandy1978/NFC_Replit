import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { businessCardFormSchema, type BusinessCard } from "@shared/schema";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";
import { RiMailLine, RiPhoneLine, RiGlobalLine } from "react-icons/ri";
import FileUpload from "@/components/file-upload";
import SocialMediaField from "@/components/social-media-field";

interface CardFormProps {
  defaultValues?: Partial<BusinessCard>;
  onFormChange?: (values: Partial<BusinessCard>) => void;
  autoSave?: boolean;
}

const CardForm = ({ defaultValues, onFormChange, autoSave = true }: CardFormProps) => {
  const form = useForm<BusinessCard>({
    resolver: zodResolver(businessCardFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      jobTitle: "",
      company: "",
      email: "",
      phone: "",
      website: "",
      bio: "",
      socialMedia: [],
      template: "Classic",
      ...defaultValues
    }
  });
  
  // Set up auto-save
  const { status } = useAutoSave(form, {
    onSaveSuccess: (data) => {
      console.log("Auto-saved card data:", data);
    }
  });
  
  // Watch form values to notify parent component of changes
  useEffect(() => {
    if (onFormChange) {
      const subscription = form.watch((value) => {
        onFormChange(value);
      });
      return () => subscription.unsubscribe();
    }
  }, [form, onFormChange]);
  
  // Update form when defaultValues change
  useEffect(() => {
    if (defaultValues) {
      Object.entries(defaultValues).forEach(([key, value]) => {
        if (value !== undefined) {
          form.setValue(key as any, value);
        }
      });
    }
  }, [defaultValues, form]);
  
  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form className="p-5 space-y-6 animate-fadeIn">
          {/* Profile Image */}
          <div>
            <FormLabel className="block text-sm font-medium text-slate-700 mb-3">Profile Image</FormLabel>
            <FormField
              control={form.control}
              name="profileImage"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FileUpload 
                      value={field.value} 
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Basic Info Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm font-medium text-slate-700 mb-1">First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm font-medium text-slate-700 mb-1">Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium text-slate-700 mb-1">Job Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium text-slate-700 mb-1">Company</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Contact Info Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">Contact Information</h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium text-slate-700 mb-1">Email</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">
                          <RiMailLine />
                        </span>
                        <Input 
                          className="flex-1 rounded-none rounded-r-md" 
                          type="email"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium text-slate-700 mb-1">Phone</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">
                          <RiPhoneLine />
                        </span>
                        <Input 
                          className="flex-1 rounded-none rounded-r-md" 
                          type="tel"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium text-slate-700 mb-1">Website</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">
                          <RiGlobalLine />
                        </span>
                        <Input 
                          className="flex-1 rounded-none rounded-r-md" 
                          type="url"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Social Media Section */}
          <SocialMediaField name="socialMedia" />

          {/* Bio Section */}
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-medium text-slate-700 mb-1">Bio / About Me</FormLabel>
                <FormControl>
                  <Textarea 
                    rows={3}
                    {...field} 
                  />
                </FormControl>
                <p className="mt-1 text-xs text-slate-500">Brief description for your profile. Maximum 200 characters.</p>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </FormProvider>
  );
};

export default CardForm;
