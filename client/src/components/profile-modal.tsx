import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { insertProfileSchema, type Profile } from "@shared/schema";

const profileFormSchema = insertProfileSchema.partial();
type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProfileFormValues) => Promise<void>;
  profile?: Profile;
  title: string;
}

export default function ProfileModal({
  isOpen,
  onClose,
  onSave,
  profile,
  title,
}: ProfileModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile?.name || "",
      briefIntro: profile?.briefIntro || "",
    },
  });

  // Reset form when modal opens/closes or profile changes
  useEffect(() => {
    if (isOpen && profile) {
      reset({
        name: profile.name,
        briefIntro: profile.briefIntro,
      });
    }
  }, [isOpen, profile, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    
    try {
      await onSave(data);
      onClose();
      // Don't show toast here - the mutation will handle it
    } catch (error) {
      // Don't show toast here - the mutation will handle it
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-baron text-xl tracking-wide">
            {title.toUpperCase()}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Your full name"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Brief Introduction */}
          <div className="space-y-2">
            <Label htmlFor="briefIntro">Brief Introduction *</Label>
            <Textarea
              id="briefIntro"
              {...register("briefIntro")}
              placeholder="Write a brief professional introduction about yourself..."
              rows={6}
              className="resize-none"
            />
            {errors.briefIntro && (
              <p className="text-sm text-red-600">{errors.briefIntro.message}</p>
            )}
            <p className="text-sm text-gray-500">
              This will appear in the hero section of your portfolio.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Profile
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}