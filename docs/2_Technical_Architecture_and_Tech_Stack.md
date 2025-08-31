# Technical Architecture and Tech Stack

## Architecture Overview  
- Single lightweight web application deployable on Windows laptops without heavy dependencies.  
- Local embedded database for storage to reduce overhead.  
- Minimal third-party dependencies to ensure compatibility with older OS/hardware.  
- Development environment and deployment supporting Windows, macOS, and Linux for flexibility and developer convenience.

## Suggested Tech Stack  

| Layer                   | Technology/Tool                                                   | Justification                                 |
|-------------------------|------------------------------------------------------------------|-----------------------------------------------|
| Frontend                | Electron for desktop app (or lightweight web with Chrome/Edge)  | Cross-platform desktop app with standard UI   |
| Backend                 | Node.js with lightweight framework or Python Flask              | Cross-platform runtime, minimal footprint     |
| Database                | SQLite or LiteDB (for .NET with Windows focus)                   | Embedded, no heavy setup, SQLite preferred for cross-platform |
| API                     | Local REST or IPC communication within app                       | Simple integration                             |
| Hosting/Infrastructure  | Standalone laptop deployment, no server dependency               | Runs locally, no network needed                |
| Security                | Local user authentication, encrypted local data                  | Protect patient data on device                 |
| CI/CD                   | Cross-platform build scripts (Node.js/npm, Python, or Docker)    | Enables development and packaging on all OS   |

## Excluded Components  
- Notification module removed from technical plan for now.  

