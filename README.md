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
- **Terminal Interface**: Full kubectl command support
  - `kubectl get` - List resources (pods, deployments, daemonsets, namespaces)
  - `kubectl describe` - Get detailed information about resources
  - `kubectl delete` - Delete resources (pods, deployments, daemonsets, namespaces)
  - `kubectl apply` - Simulated apply command
  - Namespace filtering with `-n` flag
  - Command history with arrow keys
- **Keyboard Navigation**: 
  - `↑` / `↓` - Navigate through resources
  - `Ctrl+N` / `Ctrl+P` - Switch between resource types
  - `/` - Filter resources by name
  - `Esc` - Clear filter and namespace selection
  - `Ctrl+T` - Toggle terminal window
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

### Main Interface
- **Navigate Resources**: Use arrow keys or click on rows to select them
- **Switch Resource Types**: Use `Ctrl+N` to go to next resource type, `Ctrl+P` for previous, or click the tabs
- **Filter**: Press `/` to filter resources by name
- **View Namespace**: Click on a namespace to filter resources by that namespace
- **View Pod Details**: Select a pod with an error to see detailed error information in the side panel

### Terminal Commands
Open the terminal with `Ctrl+T` or click the "Terminal" button in the header. The terminal supports:

**Get Resources:**
```bash
kubectl get pods
kubectl get pods -n default
kubectl get deployments
kubectl get daemonsets
kubectl get namespaces
kubectl get pods <pod-name>
```

**Describe Resources:**
```bash
kubectl describe pod <pod-name>
kubectl describe pod <pod-name> -n default
kubectl describe deployment <deployment-name>
kubectl describe daemonset <daemonset-name>
kubectl describe namespace <namespace-name>
```

**Delete Resources:**
```bash
kubectl delete pod <pod-name>
kubectl delete pod <pod-name> -n default
kubectl delete deployment <deployment-name>
kubectl delete daemonset <daemonset-name>
kubectl delete namespace <namespace-name>
```

**Other Commands:**
```bash
kubectl apply -f <file>  # Simulated - shows a message
help                      # Show available commands
```

**Terminal Features:**
- Command history: Use `↑` and `↓` to navigate through previous commands
- Auto-scroll: Terminal automatically scrolls to show latest output
- Error handling: Invalid commands show helpful error messages

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
  ├── Terminal.tsx     # Terminal component with kubectl command support
  ├── Terminal.css     # Terminal styles
  ├── main.tsx         # Application entry point
  ├── index.css        # Global styles
  ├── types.ts         # TypeScript type definitions
  └── mockData.ts      # Mock Kubernetes data generator
```

