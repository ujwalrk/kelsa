// components/DndContextWrapper.tsx
"use client";

import { DragDropContext, DropResult, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd'; // ADD THESE TYPES
import { ReactNode } from 'react';

interface DndContextWrapperProps {
  children: ReactNode;
  onDragEnd: (result: DropResult) => void;
}

export default function DndContextWrapper({ children, onDragEnd }: DndContextWrapperProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {children}
    </DragDropContext>
  );
}