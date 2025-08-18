import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { CaseStudy } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
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

async function fetchCaseStudy(slug: string): Promise<CaseStudy> {
  const response = await fetch(`/api/case-studies/${slug}`);
  if (!response.ok) {
    throw new Error("Failed to fetch case study");
  }
  return response.json();
}

export default function CaseStudyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const editorRef = useRef<EditorJS | null>(null);
  const editorContainer = useRef<HTMLDivElement>(null);

  const { data: caseStudy, isLoading, error } = useQuery({
    queryKey: ["case-study", slug],
    queryFn: () => fetchCaseStudy(slug!),
    enabled: !!slug,
  });

  // Initialize read-only Editor.js for displaying content
  useEffect(() => {
    if (caseStudy?.content && editorContainer.current && !editorRef.current) {
      try {
        const editorData = JSON.parse(caseStudy.content);
        
        editorRef.current = new EditorJS({
          holder: editorContainer.current,
          readOnly: true,
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
            },
            list: {
              class: List as any,
            },
            quote: {
              class: Quote as any,
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
            },
            linkTool: {
              class: LinkTool as any,
            },
          },
          data: editorData,
        });

        editorRef.current.isReady.then(() => {
          console.log("Read-only editor initialized");
        });
      } catch (error) {
        console.error("Failed to parse case study content:", error);
      }
    }

    return () => {
      if (editorRef.current) {
        try {
          editorRef.current.destroy();
        } catch (e) {
          console.log("Editor already destroyed");
        }
        editorRef.current = null;
      }
    };
  }, [caseStudy]);

  const handleGoBack = () => {
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white font-apercu flex items-center justify-center">
        <div className="text-gray-600">Loading case study...</div>
      </div>
    );
  }

  if (error || !caseStudy) {
    return (
      <div className="min-h-screen bg-white font-apercu flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Case Study Not Found</h1>
          <p className="text-gray-600 mb-6">The case study you're looking for doesn't exist.</p>
          <Button onClick={handleGoBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-apercu">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Button 
            onClick={handleGoBack} 
            variant="ghost" 
            className="mb-4 text-gray-600 hover:text-sollo-red"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portfolio
          </Button>
          
          {/* Featured Image */}
          {caseStudy.featuredImage && (
            <div className="w-full h-64 md:h-80 overflow-hidden rounded-lg mb-6">
              <img
                src={caseStudy.featuredImage}
                alt={caseStudy.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Title and Metadata */}
          <div className="space-y-4">
            <h1 className="font-baron text-3xl md:text-4xl tracking-wide text-gray-900">
              {caseStudy.title.toUpperCase()}
            </h1>
            
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
              {caseStudy.description}
            </p>

            {/* Metadata */}
            <div className="flex items-center gap-6 text-sm text-gray-500">
              {caseStudy.createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(caseStudy.createdAt).toLocaleDateString()}
                </div>
              )}
              
              {caseStudy.tags && caseStudy.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <div className="flex gap-2">
                    {caseStudy.tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-lg max-w-none">
          <div ref={editorContainer} />
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Button onClick={handleGoBack} variant="outline" className="mx-auto flex">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portfolio
          </Button>
        </div>
      </div>
    </div>
  );
}