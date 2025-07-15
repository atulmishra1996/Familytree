# Family Tree Application Design Document

## Overview

The Family Tree application is a web-based genealogy tool built with modern web technologies. The application uses a component-based architecture with React for the frontend, providing an interactive tree visualization using D3.js or a similar library. The backend uses Node.js with Express and a JSON-based data storage system for simplicity, with the option to migrate to a database later.

The application follows a hierarchical tree structure where each person is a node with relationships to parents and children. The UI emphasizes visual clarity through strategic use of colors, positioning, and connecting lines to represent family relationships.

## Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety
- **State Management**: React Context API for global state management
- **Visualization**: D3.js or React-based tree library (react-d3-tree) for tree rendering
- **Styling**: CSS Modules or Styled Components for component-scoped styling
- **Routing**: React Router for navigation between views

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Data Storage**: JSON files for initial implementation (easily migrated to database)
- **API**: RESTful API endpoints for CRUD operations
- **Validation**: Joi or similar library for input validation

### Data Flow
```
User Interface → React Components → API Calls → Express Routes → Data Layer → JSON Storage
```

## Components and Interfaces

### Core Components

#### 1. FamilyTreeApp (Root Component)
- Main application container
- Manages global state and routing
- Handles authentication (future enhancement)

#### 2. TreeVisualization
- Renders the interactive family tree
- Handles zoom, pan, and navigation
- Manages node positioning and connections
- Props: `treeData`, `onNodeClick`, `onNodeAdd`

#### 3. PersonNode
- Individual family member representation in the tree
- Displays basic info (name, photo thumbnail)
- Handles click events for detail view
- Props: `person`, `isSelected`, `onClick`

#### 4. PersonDetails
- Modal or sidebar component for detailed person information
- Form for editing person details
- Handles save/cancel operations
- Props: `person`, `isEditing`, `onSave`, `onCancel`

#### 5. AddPersonForm
- Form component for adding new family members
- Validates required fields
- Handles parent-child relationship creation
- Props: `parentId`, `onSubmit`, `onCancel`

#### 6. NavigationControls
- Zoom in/out buttons
- Pan controls
- Tree centering functionality
- Search functionality (future enhancement)

### Data Interfaces

#### Person Interface
```typescript
interface Person {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  dateOfBirth?: Date;
  placeOfBirth?: string;
  phoneNumber?: string;
  profilePhoto?: string;
  parentIds: string[];
  childrenIds: string[];
  spouseId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### FamilyTree Interface
```typescript
interface FamilyTree {
  id: string;
  name: string;
  rootPersonIds: string[];
  persons: Person[];
  createdAt: Date;
  updatedAt: Date;
}
```

### API Endpoints

#### Person Management
- `GET /api/persons` - Get all persons
- `GET /api/persons/:id` - Get specific person
- `POST /api/persons` - Create new person
- `PUT /api/persons/:id` - Update person
- `DELETE /api/persons/:id` - Delete person

#### Relationship Management
- `POST /api/persons/:id/children` - Add child to person
- `DELETE /api/persons/:parentId/children/:childId` - Remove parent-child relationship
- `POST /api/persons/:id/spouse` - Add spouse relationship

#### Tree Management
- `GET /api/tree` - Get complete family tree
- `POST /api/tree/initialize` - Initialize new tree with root parents

## Data Models

### Storage Structure
The application uses a file-based JSON storage system with the following structure:

```
data/
├── familyTree.json          # Main tree metadata
├── persons/
│   ├── person-1.json       # Individual person files
│   ├── person-2.json
│   └── ...
└── relationships.json       # Relationship mappings
```

### Person Data Model
Each person is stored as a separate JSON file with comprehensive profile information. The model supports:
- Basic demographic information
- Contact details
- Family relationships (parents, children, spouse)
- Metadata (creation/update timestamps)

### Relationship Model
Relationships are managed through bidirectional references:
- Parent-child relationships stored in both parent's `childrenIds` and child's `parentIds`
- Spouse relationships stored in both partners' `spouseId` fields
- Relationship integrity maintained through validation

## Error Handling

### Frontend Error Handling
- **Network Errors**: Display user-friendly messages for API failures
- **Validation Errors**: Real-time form validation with clear error messages
- **State Errors**: Graceful handling of invalid tree states
- **Loading States**: Loading indicators during API calls

### Backend Error Handling
- **Input Validation**: Comprehensive validation using Joi schemas
- **Relationship Integrity**: Validation to prevent circular relationships
- **File System Errors**: Proper error handling for file operations
- **API Error Responses**: Consistent error response format

### Error Response Format
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: Date;
}
```

## Testing Strategy

### Unit Testing
- **Component Testing**: React Testing Library for component behavior
- **Utility Functions**: Jest for data manipulation and validation functions
- **API Endpoints**: Supertest for API route testing
- **Data Models**: Validation and relationship integrity tests

### Integration Testing
- **API Integration**: End-to-end API workflow testing
- **Component Integration**: Testing component interactions
- **Data Flow**: Testing complete user workflows

### Visual Testing
- **Tree Rendering**: Snapshot testing for tree visualization
- **Responsive Design**: Testing across different screen sizes
- **Accessibility**: Testing for keyboard navigation and screen readers

### Test Coverage Goals
- Minimum 80% code coverage
- 100% coverage for critical paths (data integrity, relationships)
- Performance testing for large family trees (100+ members)

## User Experience Considerations

### Visual Design
- **Hierarchy**: Clear visual hierarchy with generations positioned vertically
- **Connections**: Elegant connecting lines between family members
- **Color Coding**: Subtle color differences for generations or family branches
- **Responsive Design**: Mobile-friendly interface with touch gestures

### Interaction Design
- **Click Interactions**: Single click for selection, double click for details
- **Drag and Drop**: Future enhancement for tree reorganization
- **Keyboard Navigation**: Full keyboard accessibility
- **Touch Gestures**: Pinch-to-zoom and pan on mobile devices

### Performance Optimization
- **Lazy Loading**: Load person details on demand
- **Virtual Scrolling**: For large family trees
- **Caching**: Client-side caching of frequently accessed data
- **Debounced Search**: Efficient search implementation