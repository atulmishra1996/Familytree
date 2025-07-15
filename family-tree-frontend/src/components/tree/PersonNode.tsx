import type { Person } from '../../types/Person';
import './PersonNode.css';

interface PersonNodeProps {
  nodeDatum: {
    name: string;
    attributes?: Record<string, string | number | boolean>;
  };
  onNodeClick: (personId: string) => void;
  onNodeMouseEnter?: (personId: string) => void;
  onNodeMouseLeave?: () => void;
  onAddChild?: (personId: string) => void;
  persons?: Person[];
}

export function PersonNode({ 
  nodeDatum, 
  onNodeClick, 
  onNodeMouseEnter, 
  onNodeMouseLeave, 
  onAddChild,
  persons = []
}: PersonNodeProps) {
  const attributes = nodeDatum.attributes;
  
  // Handle case where attributes might be undefined
  if (!attributes) {
    return (
      <g className="person-node error">
        <circle
          r={30}
          fill="#f44336"
          stroke="#d32f2f"
          strokeWidth={2}
        />
        <text
          textAnchor="middle"
          dy={5}
          fontSize="12"
          fill="white"
        >
          ?
        </text>
      </g>
    );
  }

  const personId = attributes.personId as string;
  const isSelected = attributes.isSelected as string;
  const isHighlighted = attributes.isHighlighted as string;
  const generation = attributes.generation as string;
  const relationshipType = attributes.relationshipType as string;
  const isSelectedBool = isSelected === 'true';
  const isHighlightedBool = isHighlighted === 'true';

  // Handle virtual root node (for multiple root persons)
  if (personId === 'virtual-root') {
    return (
      <g className="person-node virtual-root">
        <circle
          r={30}
          fill="#f0f0f0"
          stroke="#ccc"
          strokeWidth={2}
        />
        <text
          textAnchor="middle"
          dy={5}
          fontSize="12"
          fill="#666"
        >
          Family
        </text>
      </g>
    );
  }

  // Find the person data
  const person = persons.find(p => p.id === personId);
  if (!person) {
    return (
      <g className="person-node error">
        <circle
          r={30}
          fill="#f44336"
          stroke="#d32f2f"
          strokeWidth={2}
        />
        <text
          textAnchor="middle"
          dy={5}
          fontSize="12"
          fill="white"
        >
          ?
        </text>
      </g>
    );
  }

  const handleClick = () => {
    onNodeClick(person.id);
  };

  const handleMouseEnter = () => {
    onNodeMouseEnter?.(person.id);
  };

  const handleMouseLeave = () => {
    onNodeMouseLeave?.();
  };

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node click
    onAddChild?.(person.id);
  };

  // Get generation-based styling
  const getNodeStyling = () => {
    const generationNum = parseInt(generation) || 0;
    const baseRadius = 40;
    const radiusVariation = Math.max(0, 3 - generationNum) * 2; // Larger nodes for earlier generations
    const radius = baseRadius + radiusVariation;

    // Color scheme based on relationship type and generation
    let fillColor, strokeColor;
    
    if (isSelectedBool) {
      fillColor = '#4CAF50';
      strokeColor = '#45a049';
    } else {
      switch (relationshipType) {
        case 'root':
          fillColor = '#8B4513'; // Brown for root/founders
          strokeColor = '#654321';
          break;
        case 'parent':
          fillColor = '#2196F3'; // Blue for parents
          strokeColor = '#1976D2';
          break;
        case 'child':
          // Gradient colors for different generations of children
          const childColors = ['#9C27B0', '#673AB7', '#3F51B5', '#2196F3'];
          const colorIndex = Math.min(generationNum - 1, childColors.length - 1);
          fillColor = childColors[colorIndex] || '#2196F3';
          strokeColor = fillColor.replace('B0', '80').replace('B7', '85').replace('B5', '82').replace('F3', 'D2');
          break;
        default:
          fillColor = '#2196F3';
          strokeColor = '#1976D2';
      }
    }

    return { radius, fillColor, strokeColor };
  };

  const { radius, fillColor, strokeColor } = getNodeStyling();

  return (
    <g 
      className={`person-node ${relationshipType} generation-${generation} ${isSelectedBool ? 'selected' : ''} ${isHighlightedBool ? 'highlighted' : ''}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: 'pointer' }}
      role="button"
      aria-label={`${person.fullName}, ${relationshipType} in generation ${generation}${isSelectedBool ? ', selected' : ''}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Generation indicator ring */}
      {parseInt(generation) > 0 && (
        <circle
          r={radius + 8}
          fill="none"
          stroke={fillColor}
          strokeWidth={1}
          opacity={0.3}
          strokeDasharray="2,2"
          className="generation-ring"
        />
      )}

      {/* Main node circle */}
      <circle
        r={radius}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={3}
        className="node-circle"
      />
      
      {/* Person initials or photo placeholder */}
      <text
        textAnchor="middle"
        dy={5}
        fontSize="16"
        fill="white"
        fontWeight="bold"
      >
        {getInitials(person.firstName, person.lastName)}
      </text>
      
      {/* Relationship type indicator */}
      {relationshipType === 'root' && (
        <polygon
          points="-8,-8 8,-8 0,-20"
          fill="#FFD700"
          stroke="#FFA000"
          strokeWidth={1}
          className="root-indicator"
        />
      )}

      {/* Name label below the circle */}
      <text
        textAnchor="middle"
        dy={radius + 25}
        fontSize="14"
        fill="#333"
        fontWeight="500"
      >
        {person.firstName}
      </text>
      <text
        textAnchor="middle"
        dy={radius + 40}
        fontSize="14"
        fill="#333"
        fontWeight="500"
      >
        {person.lastName}
      </text>

      {/* Generation indicator */}
      {parseInt(generation) > 0 && (
        <text
          textAnchor="middle"
          dy={radius + 55}
          fontSize="10"
          fill="#666"
          opacity={0.7}
        >
          Gen {generation}
        </text>
      )}
      
      {/* Selection indicator */}
      {isSelectedBool && (
        <circle
          r={radius + 5}
          fill="none"
          stroke="#4CAF50"
          strokeWidth={2}
          strokeDasharray="5,5"
          className="selection-ring"
        />
      )}
      
      {/* Add Child button - shows when selected or highlighted */}
      {(isSelectedBool || isHighlightedBool) && onAddChild && (
        <g 
          className="add-child-button-group"
          role="button"
          aria-label={`Add child to ${person.fullName}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleAddChild(e as any);
            }
          }}
        >
          <circle
            cx={0}
            cy={95}
            r={12}
            fill="#10b981"
            stroke="white"
            strokeWidth={2}
            className="add-child-button-bg"
            onClick={handleAddChild}
            style={{ cursor: 'pointer' }}
          />
          <text
            x={0}
            y={100}
            textAnchor="middle"
            fontSize="14"
            fill="white"
            fontWeight="bold"
            onClick={handleAddChild}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            +
          </text>
        </g>
      )}
      
      {/* Hover effect circle */}
      <circle
        r={radius}
        fill="transparent"
        className="hover-circle"
      />
    </g>
  );
}

function getInitials(firstName: string, lastName: string): string {
  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();
  return `${firstInitial}${lastInitial}`;
}