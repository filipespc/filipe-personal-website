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
import { Experience } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, GripVertical } from "lucide-react";

interface SortableItemProps {
  experience: Experience;
  onEdit: (experience: Experience) => void;
  onDelete: (experience: Experience) => void;
  isDragging?: boolean;
}

function SortableItem({ experience, onEdit, onDelete, isDragging }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: experience.id });

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
            {experience.jobTitle.toUpperCase()}
          </h3>
          <p className="text-sollo-red font-medium mb-1">{experience.company}</p>
          <p className="text-sollo-gold font-medium mb-1">{experience.industry}</p>
          <p className="text-sm text-gray-600">
            {experience.startDate} - {experience.isCurrentJob ? 'Present' : experience.endDate}
          </p>
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
            onClick={() => onEdit(experience)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(experience)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface SortableExperienceListProps {
  experiences: Experience[];
  onReorder: (experienceIds: number[]) => Promise<void>;
  onEdit: (experience: Experience) => void;
  onDelete: (experience: Experience) => void;
  isLoading?: boolean;
}

export default function SortableExperienceList({
  experiences,
  onReorder,
  onEdit,
  onDelete,
  isLoading = false,
}: SortableExperienceListProps) {
  const [items, setItems] = React.useState(experiences);
  const [isReordering, setIsReordering] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  React.useEffect(() => {
    setItems(experiences);
  }, [experiences]);

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
        setItems(experiences);
        console.error("Failed to reorder experiences:", error);
      } finally {
        setIsReordering(false);
      }
    }
  };

  if (isLoading) {
    return <div>Loading experiences...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No experiences to display.</p>
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
          {items.map((experience) => (
            <SortableItem
              key={experience.id}
              experience={experience}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}