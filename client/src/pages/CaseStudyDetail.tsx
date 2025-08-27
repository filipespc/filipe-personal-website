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

// Function to process markdown-style links [text](url) in rendered content
function processMarkdownLinks(container: HTMLElement | null) {
  if (!container) return;
  
  const paragraphs = container.querySelectorAll('.ce-paragraph');
  paragraphs.forEach(paragraph => {
    if (paragraph.innerHTML) {
      // Regex to match [text](url) markdown links
      const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const originalHTML = paragraph.innerHTML;
      const newHTML = originalHTML.replace(markdownLinkRegex, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
      
      if (newHTML !== originalHTML) {
        paragraph.innerHTML = newHTML;
      }
    }
  });
}

// Function to clean up quote blocks and remove editor interface elements
function processQuoteBlocks(container: HTMLElement | null) {
  if (!container) return;
  
  const quotes = container.querySelectorAll('.cdx-quote');
  quotes.forEach(quote => {
    // Remove editor interface elements
    const captions = quote.querySelectorAll('.cdx-quote__caption');
    captions.forEach(caption => {
      // If caption is empty or just contains placeholder text, hide it
      if (!caption.textContent?.trim() || caption.textContent?.trim() === 'Enter a caption') {
        caption.style.display = 'none';
      }
    });
    
    // Remove contenteditable attributes and data-placeholder
    const editables = quote.querySelectorAll('[contenteditable]');
    editables.forEach(editable => {
      editable.removeAttribute('contenteditable');
      editable.removeAttribute('data-placeholder');
    });
    
    // Apply clean, professional quote styling with minimal container border
    quote.style.border = 'none !important';
    quote.style.borderTop = 'none !important';
    quote.style.borderRight = 'none !important';
    quote.style.borderBottom = 'none !important';
    quote.style.borderLeft = '4px solid #dc2626 !important';
    quote.style.outline = 'none !important';
    quote.style.boxShadow = 'none !important';
    quote.style.backgroundColor = 'transparent !important';
    quote.style.background = 'none !important';
    quote.style.backgroundImage = 'none !important';
    quote.style.padding = '0.1rem 0 0.1rem 2rem';
    quote.style.margin = '2rem 0';
    quote.style.fontStyle = 'italic';
    quote.style.borderRadius = '0 !important';
    (quote as HTMLElement).style.position = 'relative';
    
    // Remove any nested element styling that might create boxes and fix sizing
    // But preserve list elements' natural spacing and indentation
    const allElements = quote.querySelectorAll('*:not(.cdx-list):not(.cdx-list__item)');
    allElements.forEach(el => {
      (el as HTMLElement).style.boxShadow = 'none !important';
      (el as HTMLElement).style.border = 'none !important';
      (el as HTMLElement).style.outline = 'none !important';
      (el as HTMLElement).style.backgroundColor = 'transparent !important';
      (el as HTMLElement).style.background = 'none !important';
      // Remove any fixed height that prevents natural content sizing
      (el as HTMLElement).style.height = 'auto !important';
      (el as HTMLElement).style.minHeight = 'auto !important';
    });
    
    // Ensure the quote container itself sizes to content
    quote.style.height = 'auto !important';
    quote.style.minHeight = 'auto !important';
    quote.style.maxHeight = 'none !important';
    
    // Style the quote text for better readability
    const quoteText = quote.querySelector('.cdx-quote__text') as HTMLElement;
    if (quoteText) {
      quoteText.style.fontSize = '1.125rem';
      quoteText.style.fontWeight = '400';
      quoteText.style.color = '#4b5563';
      quoteText.style.margin = '0';
      quoteText.style.lineHeight = '1.7';
      quoteText.style.fontFamily = 'Georgia, serif';
    }
    
    // Add elegant quotation mark decoration
    const beforeElement = (quote.querySelector('.quote-decoration') || document.createElement('div')) as HTMLElement;
    if (!quote.querySelector('.quote-decoration')) {
      beforeElement.className = 'quote-decoration';
      beforeElement.innerHTML = '"';
      beforeElement.style.cssText = `
        position: absolute;
        top: -0.25rem;
        left: -0.25rem;
        font-size: 3rem;
        color: #dc2626;
        opacity: 0.3;
        font-family: Georgia, serif;
        font-weight: bold;
        line-height: 1;
        pointer-events: none;
        z-index: 1;
      `;
      quote.prepend(beforeElement);
    }
  });
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
              config: {
                endpoint: "/api/fetch-url",
              },
            },
          },
          data: editorData,
        });

        editorRef.current.isReady.then(() => {
          console.log("Read-only editor initialized");
          // Process content after editor is ready
          setTimeout(() => {
            processMarkdownLinks(editorContainer.current);
            processQuoteBlocks(editorContainer.current);
          }, 100);
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
        <div className="prose prose-lg max-w-none font-apercu">
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