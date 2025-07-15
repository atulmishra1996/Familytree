# Family Tree Application

A modern, interactive web application for creating and managing family genealogy trees. Built with React, TypeScript, and Node.js, this application provides an intuitive interface for building family trees, managing family member profiles, and visualizing family relationships.

## Features

### 🌳 Interactive Tree Visualization
- **Full-screen tree display** with zoom and pan capabilities
- **Visual parent-child relationships** with connecting lines
- **Hierarchical layout** showing multiple generations
- **Responsive design** that works on desktop and mobile devices

### 👥 Family Member Management
- **Detailed profiles** for each family member including:
  - Full Name
  - Email address
  - Date of Birth
  - Place of Birth
  - Phone Number
  - Personal notes
- **Easy member addition** through guided forms
- **Profile editing** with real-time validation

### 🔗 Relationship Management
- **Root parent setup** to establish family tree foundation
- **Parent-child relationships** with automatic linking
- **Multi-generational support** for complex family structures
- **Relationship integrity** maintained automatically

### 🎯 User Experience
- **Welcome screen** for new users with guided setup
- **Click-to-view details** for any family member
- **Keyboard navigation** support for accessibility
- **Error handling** with user-friendly messages
- **Loading states** and progress indicators

## Technology Stack

### Frontend
- **React 19** with TypeScript for type safety
- **React D3 Tree** for interactive tree visualization
- **React Router** for navigation
- **CSS Modules** for component styling
- **Vite** for fast development and building

### Backend
- **Node.js** with Express.js framework
- **TypeScript** for server-side type safety
- **Joi** for input validation
- **JSON file storage** (easily upgradeable to database)
- **RESTful API** design

## Project Structure

```
family-tree/
├── family-tree-frontend/          # React frontend application
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   │   ├── tree/             # Tree visualization components
│   │   │   ├── forms/            # Form components
│   │   │   ├── common/           # Shared components
│   │   │   └── error/            # Error handling components
│   │   ├── contexts/             # React Context providers
│   │   ├── pages/                # Main page components
│   │   ├── services/             # API service layer
│   │   ├── types/                # TypeScript type definitions
│   │   └── utils/                # Utility functions
│   └── package.json
├── family-tree-backend/           # Node.js backend API
│   ├── src/
│   │   ├── models/               # Data models
│   │   ├── routes/               # API route handlers
│   │   ├── validation/           # Input validation schemas
│   │   ├── utils/                # Utility functions
│   │   └── middleware/           # Express middleware
│   ├── data/                     # JSON data storage
│   └── package.json
└── .kiro/specs/family-tree/      # Project specifications
    ├── requirements.md           # Feature requirements
    ├── design.md                # Technical design
    └── tasks.md                 # Implementation tasks
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/atulmishra1996/Familytree.git
   cd Familytree
   ```

2. **Install backend dependencies**
   ```bash
   cd family-tree-backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../family-tree-frontend
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd family-tree-backend
   npm run dev
   ```
   The backend will run on http://localhost:3001

2. **Start the frontend application**
   ```bash
   cd family-tree-frontend
   npm run dev
   ```
   The frontend will run on http://localhost:5173

3. **Open your browser**
   Navigate to http://localhost:5173 to use the application

## Usage Guide

### Creating Your First Family Tree

1. **Welcome Screen**: When you first open the application, you'll see a welcome screen
2. **Add Root Parents**: Click "Create Your Family Tree" to start adding root parents
3. **Fill Parent Details**: Enter information for one or two root parents
4. **Create Tree**: Click "Create Family Tree" to initialize your tree

### Managing Family Members

1. **View Details**: Click on any family member node to view their detailed profile
2. **Edit Information**: Use the edit button in the profile view to modify details
3. **Add Children**: Click on a parent node and select "Add Child" to expand the family
4. **Navigate Tree**: Use zoom controls and drag to navigate around large trees

### Tree Navigation

- **Zoom**: Use +/- buttons or mouse wheel to zoom in/out
- **Pan**: Click and drag to move around the tree
- **Center**: Click the center button to reset the view
- **Keyboard**: Use arrow keys to navigate between family members

## API Endpoints

### Family Tree Management
- `GET /api/tree` - Get complete family tree
- `POST /api/tree/initialize` - Initialize new tree with root parents

### Person Management
- `GET /api/persons` - Get all persons
- `GET /api/persons/:id` - Get specific person
- `POST /api/persons` - Create new person
- `PUT /api/persons/:id` - Update person
- `DELETE /api/persons/:id` - Delete person

### Relationship Management
- `POST /api/persons/:id/children` - Add child to person
- `DELETE /api/persons/:parentId/children/:childId` - Remove relationship

## Development

### Running Tests

**Backend tests:**
```bash
cd family-tree-backend
npm test
```

**Frontend tests:**
```bash
cd family-tree-frontend
npm test
```

### Building for Production

**Backend:**
```bash
cd family-tree-backend
npm run build
npm start
```

**Frontend:**
```bash
cd family-tree-frontend
npm run build
npm run preview
```

## Data Storage

The application currently uses JSON file storage for simplicity:
- `data/familyTree.json` - Main tree metadata
- `data/persons/` - Individual person files
- Easy migration path to databases (MongoDB, PostgreSQL, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] User authentication and multi-family support
- [ ] Photo uploads for family members
- [ ] Export functionality (PDF, GEDCOM)
- [ ] Advanced search and filtering
- [ ] Family statistics and insights
- [ ] Mobile app development

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/atulmishra1996/Familytree/issues) page
2. Create a new issue with detailed description
3. Contact the maintainers

## Acknowledgments

- Built with [React D3 Tree](https://github.com/bkrem/react-d3-tree) for tree visualization
- Inspired by modern genealogy applications
- Thanks to the open-source community for the amazing tools and libraries

---

**Happy Family Tree Building! 🌳👨‍👩‍👧‍👦**
