# Project Structure

## Root Directory Organization
```
.
├── .kiro/                 # Kiro AI configuration
│   └── steering/          # AI guidance rules and documentation
├── .vscode/               # VSCode workspace settings
│   └── settings.json      # Editor configuration
└── [project files]       # Application source code (to be added)
```

## Kiro Configuration
- **`.kiro/steering/`**: Contains markdown files that guide AI behavior
  - `product.md`: Product overview and development philosophy
  - `tech.md`: Technology stack and common commands
  - `structure.md`: Project organization guidelines
  - Additional steering files can be added as needed

## VSCode Configuration
- **`.vscode/settings.json`**: Workspace-specific editor settings
- Kiro MCP integration currently disabled

## Future Structure Guidelines
As the project grows, consider organizing code into:

### Typical Web Application Structure
```
src/                       # Source code
├── components/            # Reusable UI components
├── pages/                 # Application pages/routes
├── utils/                 # Utility functions
├── styles/                # CSS/styling files
└── assets/                # Static assets
```

### Typical Backend Structure
```
src/
├── controllers/           # Request handlers
├── models/                # Data models
├── routes/                # API routes
├── middleware/            # Custom middleware
├── config/                # Configuration files
└── utils/                 # Helper functions
```

## File Naming Conventions
- Use kebab-case for file names: `user-profile.js`
- Use PascalCase for component files: `UserProfile.jsx`
- Use lowercase for configuration files: `package.json`, `readme.md`

## Best Practices
- Keep related files grouped together
- Maintain clear separation between configuration and source code
- Use descriptive folder and file names
- Document project structure changes in this file