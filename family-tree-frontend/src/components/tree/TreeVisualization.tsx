import { useMemo, useState, useRef, useCallback, useEffect, memo } from 'react';
import Tree from 'react-d3-tree';
import type { Person } from '../../types/Person';
import { PersonNode } from './PersonNode';
import { NavigationControls } from '../navigation/NavigationControls';
import { AddChildModal } from '../forms/AddChildModal';
import './TreeVisualization.css';

interface TreeVisualizationProps {
  persons: Person[];
  selectedPersonId: string | null;
  onNodeClick: (personId: string) => void;
}

interface TreeNode {
  name: string;
  attributes?: {
    personId: string;
    isSelected: string; // Changed to string for react-d3-tree compatibility
    isHighlighted: string;
    generation: string; // Add generation level for visual hierarchy
    relationshipType: string; // Add relationship type for styling
  };
  children?: TreeNode[];
}

export const TreeVisualization = memo(function TreeVisualization({ persons, selectedPersonId, onNodeClick }: TreeVisualizationProps) {
  // Early return if no persons data
  if (!persons || persons.length === 0) {
    return (
      <div className="tree-visualization-empty">
        <p>No family members to display</p>
      </div>
    );
  }

  const [zoom, setZoom] = useState(1.2);
  const [translate, setTranslate] = useState({ x: window.innerWidth / 2, y: 150 });
  const [hoveredPersonId, setHoveredPersonId] = useState<string | null>(null);
  const [addChildModalOpen, setAddChildModalOpen] = useState(false);
  const [selectedParentForChild, setSelectedParentForChild] = useState<Person | null>(null);
  const treeRef = useRef<any>(null);

  // Zoom and pan controls
  const minZoom = 0.1;
  const maxZoom = 2.0;
  const zoomStep = 0.2;

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + zoomStep, maxZoom));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - zoomStep, minZoom));
  }, []);

  const handleCenterTree = useCallback(() => {
    // Reset to center position
    setTranslate({ x: window.innerWidth / 2, y: 150 });
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1.2);
    setTranslate({ x: window.innerWidth / 2, y: 150 });
  }, []);

  // Handle node hover for relationship highlighting
  const handleNodeMouseEnter = useCallback((personId: string) => {
    setHoveredPersonId(personId);
  }, []);

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredPersonId(null);
  }, []);

  // Enhanced node click handler
  const handleNodeClick = useCallback((personId: string) => {
    onNodeClick(personId);
    setHoveredPersonId(null);
  }, [onNodeClick]);

  // Add child handlers
  const handleAddChild = useCallback((personId: string) => {
    const parent = persons.find(p => p.id === personId);
    if (parent) {
      setSelectedParentForChild(parent);
      setAddChildModalOpen(true);
    }
  }, [persons]);

  const handleChildAdded = useCallback((child: Person) => {
    // The child is already added to the context by the AddChildModal
    // We can optionally select the new child
    onNodeClick(child.id);
  }, [onNodeClick]);

  const handleCloseAddChildModal = useCallback(() => {
    setAddChildModalOpen(false);
    setSelectedParentForChild(null);
  }, []);

  // Navigate to related family members using keyboard
  const navigateToRelative = useCallback((direction: 'parent' | 'child' | 'sibling-left' | 'sibling-right') => {
    if (!selectedPersonId) {
      // If no person selected, select the first root person
      const rootPersons = persons.filter(person => person.parentIds && person.parentIds.length === 0);
      if (rootPersons.length > 0) {
        onNodeClick(rootPersons[0].id);
      }
      return;
    }

    const currentPerson = persons.find(p => p.id === selectedPersonId);
    if (!currentPerson || !currentPerson.parentIds || !currentPerson.childrenIds) return;

    switch (direction) {
      case 'parent':
        if (currentPerson.parentIds.length > 0) {
          onNodeClick(currentPerson.parentIds[0]);
        }
        break;
      case 'child':
        if (currentPerson.childrenIds.length > 0) {
          onNodeClick(currentPerson.childrenIds[0]);
        }
        break;
      case 'sibling-left':
      case 'sibling-right':
        // Find siblings (people with same parents)
        const siblings = persons.filter(person =>
          person.id !== selectedPersonId &&
          person.parentIds && person.parentIds.length > 0 &&
          currentPerson.parentIds && currentPerson.parentIds.length > 0 &&
          person.parentIds.some(parentId => currentPerson.parentIds.includes(parentId))
        );

        if (siblings.length > 0) {
          const currentIndex = siblings.findIndex(s => s.id === selectedPersonId);
          let nextIndex;

          if (direction === 'sibling-left') {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : siblings.length - 1;
          } else {
            nextIndex = currentIndex < siblings.length - 1 ? currentIndex + 1 : 0;
          }

          if (siblings[nextIndex]) {
            onNodeClick(siblings[nextIndex].id);
          }
        }
        break;
    }
  }, [selectedPersonId, persons, onNodeClick]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keyboard events when not in a modal or input field
      if (addChildModalOpen || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case '+':
        case '=':
          event.preventDefault();
          handleZoomIn();
          break;
        case '-':
          event.preventDefault();
          handleZoomOut();
          break;
        case '0':
          event.preventDefault();
          handleResetZoom();
          break;
        case 'c':
        case 'C':
          event.preventDefault();
          handleCenterTree();
          break;
        case 'ArrowUp':
          event.preventDefault();
          navigateToRelative('parent');
          break;
        case 'ArrowDown':
          event.preventDefault();
          navigateToRelative('child');
          break;
        case 'ArrowLeft':
          event.preventDefault();
          navigateToRelative('sibling-left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          navigateToRelative('sibling-right');
          break;
        case 'Enter':
        case ' ':
          if (selectedPersonId) {
            event.preventDefault();
            handleAddChild(selectedPersonId);
          }
          break;
        case 'Escape':
          event.preventDefault();
          if (selectedPersonId) {
            onNodeClick(''); // Deselect
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [addChildModalOpen, selectedPersonId, handleZoomIn, handleZoomOut, handleResetZoom, handleCenterTree, handleAddChild, onNodeClick, navigateToRelative]);

  // Performance monitoring for large family trees
  const isLargeTree = persons.length > 50;
  const isVeryLargeTree = persons.length > 200;

  // Convert persons array to tree structure with performance optimizations
  const treeData = useMemo(() => {
    const startTime = performance.now();

    if (persons.length === 0) return null;

    // Find root persons (those with no parents)
    const rootPersons = persons.filter(person => person.parentIds.length === 0);

    if (rootPersons.length === 0) {
      // If no root persons found, use the first person as root
      return buildTreeNode(persons[0], persons, selectedPersonId, hoveredPersonId, 0, 'root');
    }

    // If multiple root persons, create a virtual root
    if (rootPersons.length > 1) {
      return {
        name: 'Family Tree',
        attributes: {
          personId: 'virtual-root',
          isSelected: 'false',
          isHighlighted: 'false',
          generation: '0',
          relationshipType: 'virtual-root',
        },
        children: rootPersons.map(person => buildTreeNode(person, persons, selectedPersonId, hoveredPersonId, 1, 'root'))
      };
    }

    // Single root person
    const result = buildTreeNode(rootPersons[0], persons, selectedPersonId, hoveredPersonId, 0, 'root');

    // Performance monitoring
    const endTime = performance.now();
    const buildTime = endTime - startTime;

    if (isLargeTree && buildTime > 100) {
      console.warn(`Tree build took ${buildTime.toFixed(2)}ms for ${persons.length} persons`);
    }

    return result;
  }, [persons, selectedPersonId, hoveredPersonId, isLargeTree]);

  if (!treeData) {
    return (
      <div className="tree-visualization-empty">
        <p>No family members to display</p>
      </div>
    );
  }

  return (
    <div
      className="tree-visualization"
      role="application"
      aria-label="Family Tree Visualization"
      tabIndex={0}
    >
      {/* Keyboard shortcuts help */}
      <div className="sr-only" aria-live="polite">
        Use arrow keys to navigate between family members.
        Press + or - to zoom. Press C to center tree.
        Press Enter or Space to add a child. Press Escape to deselect.
      </div>

      <NavigationControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onCenterTree={handleCenterTree}
        onResetZoom={handleResetZoom}
        currentZoom={zoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
      />

      <Tree
        ref={treeRef}
        data={treeData}
        orientation="vertical"
        translate={translate}
        zoom={zoom}
        separation={{ siblings: 1.8, nonSiblings: 2.2 }}
        nodeSize={{ x: 180, y: 160 }}
        renderCustomNodeElement={(nodeProps) => (
          <PersonNode
            {...nodeProps}
            onNodeClick={handleNodeClick}
            onNodeMouseEnter={handleNodeMouseEnter}
            onNodeMouseLeave={handleNodeMouseLeave}
            onAddChild={handleAddChild}
            persons={persons}
          />
        )}
        pathFunc="step"
        enableLegacyTransitions={!isVeryLargeTree} // Disable animations for very large trees
        scaleExtent={{ min: minZoom, max: maxZoom }}
        depthFactor={isVeryLargeTree ? -1 : undefined} // Collapse deep nodes for performance
        onUpdate={(state) => {
          if (state) {
            setZoom(state.zoom || zoom);
            setTranslate(state.translate || translate);
          }
        }}
      />

      {/* Add Child Modal */}
      {selectedParentForChild && (
        <AddChildModal
          parent={selectedParentForChild}
          isOpen={addChildModalOpen}
          onClose={handleCloseAddChildModal}
          onChildAdded={handleChildAdded}
        />
      )}
    </div>
  );
});

function buildTreeNode(person: Person, allPersons: Person[], selectedPersonId: string | null, hoveredPersonId: string | null, generation: number = 0, relationshipType: string = 'child'): TreeNode {
  const children = person.childrenIds
    .map(childId => allPersons.find(p => p.id === childId))
    .filter((child): child is Person => child !== undefined)
    .map(child => buildTreeNode(child, allPersons, selectedPersonId, hoveredPersonId, generation + 1, 'child'));

  // Determine if this person should be highlighted
  const isHighlighted = hoveredPersonId ? isRelatedToPerson(person.id, hoveredPersonId, allPersons) : false;

  // Determine relationship type based on generation and family structure
  let nodeRelationshipType = relationshipType;
  if (generation === 0) {
    nodeRelationshipType = 'root';
  } else if (person.parentIds.length === 0 && generation > 0) {
    nodeRelationshipType = 'root';
  } else if (person.childrenIds.length > 0) {
    nodeRelationshipType = 'parent';
  } else {
    nodeRelationshipType = 'child';
  }

  return {
    name: person.fullName,
    attributes: {
      personId: person.id,
      isSelected: person.id === selectedPersonId ? 'true' : 'false',
      isHighlighted: isHighlighted ? 'true' : 'false',
      generation: generation.toString(),
      relationshipType: nodeRelationshipType,
    },
    children: children.length > 0 ? children : undefined,
  };
}

function isRelatedToPerson(personId: string, hoveredPersonId: string, allPersons: Person[]): boolean {
  if (personId === hoveredPersonId) return true;

  const hoveredPerson = allPersons.find(p => p.id === hoveredPersonId);
  if (!hoveredPerson) return false;

  // Check if this person is a parent, child, or sibling of the hovered person
  const person = allPersons.find(p => p.id === personId);
  if (!person) return false;

  // Direct parent-child relationship
  if (hoveredPerson.parentIds.includes(personId) || hoveredPerson.childrenIds.includes(personId)) {
    return true;
  }

  // Direct child-parent relationship
  if (person.parentIds.includes(hoveredPersonId) || person.childrenIds.includes(hoveredPersonId)) {
    return true;
  }

  // Sibling relationship (share at least one parent)
  const sharedParents = person.parentIds.filter(parentId => hoveredPerson.parentIds.includes(parentId));
  if (sharedParents.length > 0) {
    return true;
  }

  return false;
}