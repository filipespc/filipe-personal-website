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
  const editorRef = useRef<EditorJS | null>(null);
  const editorContainer = useRef<HTMLDivElement>(null);

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

  // Initialize Editor.js
  useEffect(() => {
    if (isOpen && editorContainer.current && !editorRef.current) {
      const initializeEditor = async () => {
        try {
          editorRef.current = new EditorJS({
            holder: editorContainer.current!,
            placeholder: "Start writing your case study content...",
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
            data: caseStudy?.content ? JSON.parse(caseStudy.content) : undefined,
          });

          await editorRef.current.isReady;
        } catch (error) {
          console.error("Failed to initialize editor:", error);
        }
      };

      initializeEditor();
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [isOpen, caseStudy?.content]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (caseStudy) {
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

  const onSubmit = async (data: CaseStudyFormValues) => {
    setIsLoading(true);
    try {
      // Get content from Editor.js
      if (editorRef.current) {
        const editorData = await editorRef.current.save();
        data.content = JSON.stringify(editorData);
      }

      await onSave(data);
      onClose();
    } catch (error) {
      console.error("Failed to save case study:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (editorRef.current) {
      editorRef.current.destroy();
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
            <Label htmlFor="featuredImage">Featured Image URL</Label>
            <div className="flex gap-2">
              <Input
                id="featuredImage"
                {...register("featuredImage")}
                placeholder="https://example.com/image.jpg"
              />
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
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