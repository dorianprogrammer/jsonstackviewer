# JSON Stack Viewer

> A modern desktop JSON viewer and editor built with Electron and React

[![Release](https://img.shields.io/github/v/release/dorianprogrammer/jsonstackviewer)](https://github.com/dorianprogrammer/jsonstackviewer/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 About This Project

JSON Stack Viewer is a **personal open-source project** that I developed to streamline my daily workflow when working with JSON data. As a software developer with 5 years of professional experience, I frequently needed a reliable, efficient tool for viewing and editing JSON files during development and debugging sessions.

This application serves as both a **practical development tool** and a **portfolio piece** demonstrating my skills in:
- Desktop application development with Electron
- Modern React architecture and component design
- User experience and interface design
- Project planning and execution from concept to production

**👨‍💻 Developer:** Dorian Rodrigez Ruiz  
**📧 Contact:** dorianrr98@gmail.com
**💼 LinkedIn:** [https://www.linkedin.com/in/dorian-rodriguez-ruiz/]

---

## ✨ Features

### Core Functionality
- 📑 **Multi-tab Support** - Work with multiple JSON files simultaneously
- 🔀 **Split-View Editor** - Real-time editing with live preview
- 🎨 **Syntax Highlighting** - Color-coded JSON for better readability
- 📊 **Collapsible Tree View** - Navigate complex JSON structures easily
- 💾 **Auto-Save** - Never lose your work
- 🔢 **Line Numbers** - Professional code editor experience

### Advanced Features
- 🔍 **Powerful Search** (Ctrl+F)
  - Real-time match highlighting
  - Case-sensitive and exact match options
  - Navigate through results with keyboard
  - Live match counter
- 🚀 **Quick Tab Switcher** (Ctrl+P)
  - Fuzzy search across all open tabs
  - Keyboard-first navigation
- ↕️ **Resizable Panels** - Customizable layout (30/70 default split)
- ⬆️ **Scroll to Top** - Quick navigation for large files
- 🌙 **Dark Theme** - Designed for extended use

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+T` | New tab |
| `Ctrl+W` | Close current tab |
| `Ctrl+P` | Quick tab search |
| `Ctrl+F` | Search in JSON |
| `Enter` | Next search match |
| `ESC` | Close dialogs |
| `Double-click` | Rename tab |

## 📥 Download

**[Download Latest Release (v1.0.0)](https://github.com/dorianprogrammer/jsonstackviewer/releases/latest)**

Available for Windows 10/11 (64-bit)

- **Installer** - Full installation with shortcuts
- **Portable** - Run without installation

## 🛠️ Technical Stack

This project showcases modern development practices and technologies:
```
Frontend:          React 18, Lucide Icons
Desktop Framework: Electron 40.4.1
Build System:      Webpack 5
State Management:  React Hooks (useState, useEffect, useRef)
Persistence:       electron-store
Styling:           Pure CSS with custom design system
```

### Key Technical Implementations

- **Custom Resizable Panels** - Built from scratch with smooth drag interactions
- **JSON Tree Renderer** - Recursive component architecture for nested data
- **Search Engine** - Efficient text matching with highlight management
- **Tab Management** - Complete state persistence across sessions
- **Keyboard Navigation** - Comprehensive shortcut system

## 💻 Development

### Prerequisites
- Node.js 16+
- npm or yarn

### Setup
```bash
# Clone repository
git clone https://github.com/dorianprogrammer/jsonstackviewer.git
cd jsonstackviewer

# Install dependencies
npm install

# Run in development mode
npm run dev    # Terminal 1: Build React app with hot reload
npm start      # Terminal 2: Launch Electron

# Build for production
npm run build
npm run dist:win
```

### Project Structure
```
jsonstackviewer/
├── src/
│   ├── components/       # React components
│   │   ├── JsonEditor.js
│   │   ├── JsonViewer.js
│   │   ├── JsonTree.js
│   │   ├── TabBar.js
│   │   ├── Tab.js
│   │   ├── TabSearch.js
│   │   └── ResizablePanels.js
│   ├── App.js           # Main application
│   ├── App.css          # Styling
│   └── index.js         # Entry point
├── main.js              # Electron main process
├── preload.js           # Preload script (IPC bridge)
├── webpack.config.js    # Webpack configuration
└── package.json         # Dependencies and scripts
```

## 🎓 Development Highlights

This project demonstrates:

1. **Clean Architecture** - Separation of concerns with React components
2. **Performance Optimization** - Efficient rendering of large JSON files
3. **User-Centered Design** - Keyboard shortcuts and intuitive UI
4. **State Management** - Persistent storage with electron-store
5. **Build Pipeline** - Complete Electron packaging and distribution
6. **Git Workflow** - Proper version control and release management

## 🎯 Use Cases

I use JSON Stack Viewer daily for:
- API response debugging
- Configuration file management
- Data structure visualization
- JSON transformation and editing
- Development and testing workflows

## 🚀 Future Enhancements

Potential features I'm considering:
- [ ] JSON validation and error highlighting
- [ ] Import/Export functionality
- [ ] JSON formatting and beautification
- [ ] Compare mode for diff viewing
- [ ] Custom themes
- [ ] Cross-platform support (macOS, Linux)

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

While this is primarily a personal project, I welcome:
- Bug reports and feature suggestions via [Issues](https://github.com/dorianprogrammer/jsonstackviewer/issues)
- Code improvements via Pull Requests
- Stars ⭐ if you find it useful!

## 📫 Contact

**Dorian Rodriguez Ruiz**  
*Software Developer | 5+ Years Experience*

- 📧 Email: [dorianrr98@gmail.com]
- 💼 LinkedIn: [https://www.linkedin.com/in/dorian-rodriguez-ruiz/]
- 💻 GitHub: [@dorianprogrammer](https://github.com/dorianprogrammer)

---

### 💡 About Me

I'm a software developer with 5 years of professional experience specializing in:
- Full-stack web development (Node.js, React)
- Enterprise systems and microservices
- Desktop application development
- Database design and optimization (Oracle, SQL)

This project reflects my passion for building practical tools that solve real-world problems while maintaining clean code and excellent user experience.

---

*Built with ❤️ by Dorian Rodriguez Ruiz*