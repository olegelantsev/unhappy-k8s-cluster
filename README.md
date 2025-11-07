# K9s-like Cluster Viewer

A web application that mimics the K9s terminal interface for viewing Kubernetes cluster resources. This app displays namespaces, pods, deployments, and daemonsets with various error states to simulate a "dying cluster" scenario.

## Features

- **K9s-like Terminal UI**: Dark theme with terminal-style aesthetics
- **Resource Views**: Browse namespaces, pods, deployments, and daemonsets
- **Error States**: Half of the pods display various Kubernetes errors:
  - OOM Killed (Out of Memory)
  - CPU Throttling
  - ImagePullBackOff
  - ErrImagePull
  - Unschedulable (insufficient resources)
  - CrashLoopBackOff
  - Container Creating issues
  - Init container errors
- **Keyboard Navigation**: 
  - `↑` / `↓` - Navigate through resources
  - `Ctrl+N` / `Ctrl+P` - Switch between resource types
  - `/` - Filter resources by name
  - `Esc` - Clear filter and namespace selection
- **Interactive Details**: Click on pods with errors to see detailed error messages

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

- **Navigate Resources**: Use arrow keys or click on rows to select them
- **Switch Resource Types**: Use `Ctrl+N` to go to next resource type, `Ctrl+P` for previous, or click the tabs
- **Filter**: Press `/` to filter resources by name
- **View Namespace**: Click on a namespace to filter resources by that namespace
- **View Pod Details**: Select a pod with an error to see detailed error information in the side panel

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **CSS** - Styling (no external CSS frameworks)

## Project Structure

```
src/
  ├── App.tsx          # Main application component
  ├── App.css          # Application styles
  ├── main.tsx         # Application entry point
  ├── index.css        # Global styles
  ├── types.ts         # TypeScript type definitions
  └── mockData.ts      # Mock Kubernetes data generator
```

