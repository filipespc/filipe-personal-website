import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, Image, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { insertCaseStudySchema, type CaseStudy } from "@shared/schema";
import EditorJS from "@editorjs/editorjs";
// @ts-ignore - EditorJS tools don't have perfect types
import Header from "@editorjs/header";
// @ts-ignore
import Paragraph from "@editorjs/paragraph";
// @ts-ignore
import List from "@editorjs/list";
// @ts-ignore
import Quote from "@editorjs/quote";
// @ts-ignore
import Code from "@editorjs/code";
// @ts-ignore
import Delimiter from "@editorjs/delimiter";
// @ts-ignore
import InlineCode from "@editorjs/inline-code";
// @ts-ignore
import Marker from "@editorjs/marker";
// @ts-ignore
import EditorImage from "@editorjs/image";
// @ts-ignore
import LinkTool from "@editorjs/link";

const caseStudyFormSchema = insertCaseStudySchema.extend({
  tags: z.array(z.string()).default([]),
});

type CaseStudyFormValues = z.infer<typeof caseStudyFormSchema>;

interface CaseStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CaseStudyFormValues) => Promise<void>;
  caseStudy?: CaseStudy;
  title: string;
}

export default function CaseStudyModal({
  isOpen,
  onClose,
  onSave,
  caseStudy,
  title,
}: CaseStudyModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentTag, setCurrentTag] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const editorRef = useRef<EditorJS | null>(null);
  const editorContainer = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CaseStudyFormValues>({
    resolver: zodResolver(caseStudyFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      content: "",
      featuredImage: "",
      tags: [],
      isPublished: false,
      isFeatured: false,
    },
  });

  const watchedTitle = watch("title");
  const watchedTags = watch("tags");

  // Auto-generate slug from title
  useEffect(() => {
    if (watchedTitle && !caseStudy) {
      const generatedSlug = watchedTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setValue("slug", generatedSlug);
    }
  }, [watchedTitle, setValue, caseStudy]);

  // Initialize Editor.js - separate effect that only runs after form is reset
  useEffect(() => {
    console.log("🔍 Editor effect check:", { 
      isOpen, 
      hasContainer: !!editorContainer.current, 
      hasEditor: !!editorRef.current,
      caseStudyTitle: caseStudy?.title || "new case study"
    });

    // Only initialize editor if modal is open
    if (!isOpen) {
      console.log("❌ Modal not open, skipping editor initialization");
      return;
    }

    if (editorRef.current) {
      console.log("❌ Editor already exists, skipping initialization");
      return;
    }

    if (!editorContainer.current) {
      console.log("❌ Editor container not ready, will retry...");
      // Don't return early, try to wait for container
    }

    console.log("✅ Starting editor initialization for:", caseStudy?.title || "new case study");
    
    // Wait longer to ensure form has been reset and DOM is stable
    const timer = setTimeout(async () => {
      console.log("🕒 Timer triggered, checking container...");
      
      if (!editorContainer.current) {
        console.error("💥 Editor container still not available after timeout");
        return;
      }
      
      console.log("✅ Container found, proceeding with initialization");

      // Clean up any existing editor first
      if (editorRef.current) {
        try {
          editorRef.current.destroy();
          console.log("Cleaned up existing editor");
        } catch (e) {
          console.log("No existing editor to clean up");
        }
        editorRef.current = null;
      }

      try {
        let editorData = { blocks: [] };
        
        // Parse existing content if editing
        if (caseStudy?.content && caseStudy.content.trim()) {
          console.log("Processing existing content for:", caseStudy.title);
          console.log("Content preview:", caseStudy.content.substring(0, 100) + "...");
          
          try {
            const parsed = JSON.parse(caseStudy.content);
            if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
              editorData = parsed;
              console.log("✅ Valid Editor.js content found:", {
                blocks: parsed.blocks.length,
                version: parsed.version
              });
            } else {
              console.warn("Content is not valid Editor.js format");
              editorData = { blocks: [] };
            }
          } catch (parseError) {
            console.error("Failed to parse content as JSON:", parseError);
            editorData = { blocks: [] };
          }
        } else {
          console.log("No content to load, starting fresh");
        }

        console.log("Creating Editor.js instance...");
        
        editorRef.current = new EditorJS({
          holder: editorContainer.current,
          placeholder: "Start writing your case study content...",
          minHeight: 200,
          tools: {
            header: {
              class: Header as any,
              config: {
                levels: [1, 2, 3, 4],
                defaultLevel: 2,
              },
            },
            paragraph: {
              class: Paragraph as any,
              inlineToolbar: true,
            },
            list: {
              class: List as any,
              inlineToolbar: true,
            },
            quote: {
              class: Quote as any,
              inlineToolbar: true,
            },
            code: {
              class: Code as any,
            },
            delimiter: {
              class: Delimiter as any,
            },
            inlineCode: {
              class: InlineCode as any,
            },
            marker: {
              class: Marker as any,
            },
            image: {
              class: EditorImage as any,
              config: {
                endpoints: {
                  byFile: "/api/upload-image",
                },
              },
            },
            linkTool: {
              class: LinkTool as any,
              config: {
                endpoint: "/api/fetch-url",
              },
            },
          },
          data: editorData,
        });

        await editorRef.current.isReady;
        console.log("🎉 Editor fully initialized and ready!");
        
        if (editorData.blocks && editorData.blocks.length > 0) {
          console.log(`📝 Loaded ${editorData.blocks.length} content blocks`);
        } else {
          console.log("📝 Editor ready for new content");
        }

      } catch (error) {
        console.error("💥 Editor initialization failed:", error);
        
        // Last resort fallback
        try {
          console.log("🚨 Attempting minimal fallback editor...");
          editorRef.current = new EditorJS({
            holder: editorContainer.current!,
            placeholder: "Editor fallback mode - start typing...",
            tools: {
              paragraph: { class: Paragraph as any },
            },
          });
          await editorRef.current.isReady;
          console.log("✅ Fallback editor ready");
        } catch (fallbackError) {
          console.error("💥 Even fallback failed:", fallbackError);
        }
      }
    }, 500); // Longer delay to ensure everything is settled

    return () => clearTimeout(timer);
    
  }, [isOpen, caseStudy?.id]); // Depend on case study ID to reinitialize when switching between case studies

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (editorRef.current) {
        try {
          editorRef.current.destroy();
          console.log("Editor cleaned up on unmount");
        } catch (e) {
          console.log("Editor already destroyed on unmount");
        }
        editorRef.current = null;
      }
    };
  }, []);

  // Reset form when modal opens/closes
  useEffect(() => {
    console.log("Form reset effect triggered:", { isOpen, caseStudy: !!caseStudy });
    
    if (isOpen) {
      if (caseStudy) {
        console.log("Resetting form with case study data:", {
          title: caseStudy.title,
          slug: caseStudy.slug,
          hasContent: !!caseStudy.content,
          contentLength: caseStudy.content?.length || 0
        });
        reset({
          title: caseStudy.title,
          slug: caseStudy.slug,
          description: caseStudy.description,
          content: caseStudy.content,
          featuredImage: caseStudy.featuredImage || "",
          tags: caseStudy.tags || [],
          isPublished: caseStudy.isPublished,
          isFeatured: caseStudy.isFeatured,
        });
      } else {
        console.log("Resetting form with empty data");
        reset({
          title: "",
          slug: "",
          description: "",
          content: "",
          featuredImage: "",
          tags: [],
          isPublished: false,
          isFeatured: false,
        });
      }
    } else {
      console.log("Modal closed, cleaning up editor");
      // Clean up editor when modal closes
      if (editorRef.current) {
        try {
          editorRef.current.destroy();
          console.log("Editor destroyed on form reset");
        } catch (e) {
          console.log("Editor already destroyed during form reset");
        }
        editorRef.current = null;
      }
    }
  }, [isOpen, caseStudy, reset]);

  const handleAddTag = () => {
    if (currentTag.trim() && !watchedTags.includes(currentTag.trim())) {
      setValue("tags", [...watchedTags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      "tags",
      watchedTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setValue('featuredImage', result.file.url);
        toast({
          title: "Success!",
          description: "Image uploaded successfully.",
        });
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

      handleImageUpload(file);
    }
  };

  const onSubmit = async (data: CaseStudyFormValues) => {
    setIsLoading(true);
    try {
      // Get content from Editor.js
      if (editorRef.current) {
        try {
          const editorData = await editorRef.current.save();
          data.content = JSON.stringify(editorData);
          console.log("Saving editor data:", editorData);
        } catch (editorError) {
          console.error("Failed to save editor content:", editorError);
          // Continue with empty content if editor fails
          data.content = JSON.stringify({ blocks: [] });
        }
      } else {
        // No editor instance, save empty content
        data.content = JSON.stringify({ blocks: [] });
      }

      await onSave(data);
      onClose();
    } catch (error) {
      console.error("Failed to save case study:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save case study. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (editorRef.current) {
      try {
        editorRef.current.destroy();
      } catch (e) {
        console.log("Editor already destroyed");
      }
      editorRef.current = null;
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-baron text-xl tracking-wide">
            {title.toUpperCase()}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Enter case study title"
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                {...register("slug")}
                placeholder="url-friendly-slug"
              />
              {errors.slug && (
                <p className="text-sm text-red-600">{errors.slug.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Brief description of the case study"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Featured Image */}
          <div className="space-y-2">
            <Label htmlFor="featuredImage">Featured Image</Label>
            <div className="flex gap-2">
              <Input
                id="featuredImage"
                {...register("featuredImage")}
                placeholder="https://example.com/image.jpg or upload below"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                disabled={isUploadingImage}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploadingImage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            {watch("featuredImage") && watch("featuredImage")!.trim() && (
              <div className="mt-2">
                <img 
                  src={watch("featuredImage") || ""} 
                  alt="Featured image preview" 
                  className="max-w-xs max-h-32 object-cover rounded-md border"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag and press Enter"
              />
              <Button type="button" onClick={handleAddTag} variant="outline" size="sm">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Content Editor */}
          <div className="space-y-2">
            <Label>Content *</Label>
            <div className="border rounded-md p-4 min-h-[300px]">
              <div ref={editorContainer} />
            </div>
          </div>

          {/* Publishing Options */}
          <div className="flex items-center gap-6">
            <Controller
              name="isPublished"
              control={control}
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublished"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor="isPublished">Published</Label>
                </div>
              )}
            />

            <Controller
              name="isFeatured"
              control={control}
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFeatured"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor="isFeatured">Featured</Label>
                </div>
              )}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {caseStudy ? "Update Case Study" : "Create Case Study"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}