import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Education } from "@shared/schema";

const educationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  link: z.string().url().optional().or(z.literal("")),
  date: z.string().optional(),
  sortOrder: z.number().default(0),
});

type EducationFormData = z.infer<typeof educationSchema>;

interface EducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EducationFormData) => Promise<void>;
  education?: Education;
  title?: string;
  categories?: string[];
}

const defaultCategories = [
  "Artificial Inteligence",
  "Data Analytics", 
  "Machine Learning",
  "Product Management",
  "Software Development",
  "Business",
  "Marketing",
  "Design",
  "Other"
];

export default function EducationModal({
  isOpen,
  onClose,
  onSave,
  education,
  title = "Add Education",
  categories = defaultCategories
}: EducationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      name: "",
      category: "",
      link: "",
      date: "",
      sortOrder: 0,
    },
  });

  // Reset form when education prop changes
  useEffect(() => {
    if (education) {
      form.reset({
        name: education.name || "",
        category: education.category || "",
        link: education.link || "",
        date: education.date || "",
        sortOrder: education.sortOrder || 0,
      });
    } else {
      form.reset({
        name: "",
        category: "",
        link: "",
        date: "",
        sortOrder: 0,
      });
    }
  }, [education, form]);

  const handleSubmit = async (data: EducationFormData) => {
    try {
      setIsLoading(true);
      
      // Convert empty link to undefined
      if (data.link === "") {
        data.link = undefined;
      }

      await onSave(data);
      
      toast({
        title: "Success!",
        description: `Education ${education ? 'updated' : 'created'} successfully.`,
      });
      
      onClose();
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${education ? 'update' : 'create'} education. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Machine Learning Specialization" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://coursera.org/certificate/..." 
                        type="url"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="2024 or January 2024" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : (education ? "Update" : "Create")} Education
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}