import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Education } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, GripVertical, ExternalLink } from "lucide-react";

interface SortableItemProps {
  education: Education;
  onEdit: (education: Education) => void;
  onDelete: (education: Education) => void;
  isDragging?: boolean;
}

function SortableItem({ education, onEdit, onDelete, isDragging }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: education.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white p-6 rounded-lg border border-gray-200 ${
        isSortableDragging ? "shadow-lg" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-baron text-lg tracking-wide mb-1">
            {education.name.toUpperCase()}
          </h3>
          <p className="text-sollo-gold font-medium mb-1">{education.category}</p>
          {education.date && (
            <p className="text-sm text-gray-600 mb-2">{education.date}</p>
          )}
          {education.link && (
            <a 
              href={education.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Certificate
            </a>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600"
          >
            <GripVertical className="h-5 w-5" />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(education)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(education)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface SortableEducationListProps {
  education: Education[];
  onReorder: (educationIds: number[]) => Promise<void>;
  onEdit: (education: Education) => void;
  onDelete: (education: Education) => void;
  isLoading?: boolean;
}

export default function SortableEducationList({
  education,
  onReorder,
  onEdit,
  onDelete,
  isLoading = false,
}: SortableEducationListProps) {
  const [items, setItems] = React.useState(education);
  const [isReordering, setIsReordering] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  React.useEffect(() => {
    setItems(education);
  }, [education]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over?.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Call the reorder API
      setIsReordering(true);
      try {
        await onReorder(newItems.map(item => item.id));
      } catch (error) {
        // Revert on error
        setItems(education);
        console.error("Failed to reorder education:", error);
      } finally {
        setIsReordering(false);
      }
    }
  };

  if (isLoading) {
    return <div>Loading education...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No education entries to display.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isReordering && (
        <div className="text-sm text-blue-600 mb-2">
          Saving new order...
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((edu) => (
            <SortableItem
              key={edu.id}
              education={edu}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}