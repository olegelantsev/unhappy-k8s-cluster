import { useState, useEffect, useCallback } from 'react';
import { ResourceType, Pod, Deployment, DaemonSet, Namespace } from './types';
import { generateNamespaces, generatePods, generateDeployments, generateDaemonSets } from './mockData';
import Terminal from './Terminal';
import './App.css';

function App() {
  const [selectedResource, setSelectedResource] = useState<ResourceType>('namespaces');
  const [selectedNamespace, setSelectedNamespace] = useState<string | null>(null);
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [pods, setPods] = useState<Pod[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [daemonSets, setDaemonSets] = useState<DaemonSet[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filter, setFilter] = useState('');
  const [showTerminal, setShowTerminal] = useState(false);

  useEffect(() => {
    setNamespaces(generateNamespaces());
    setPods(generatePods());
    setDeployments(generateDeployments());
    setDaemonSets(generateDaemonSets());
  }, []);

  const getCurrentResources = () => {
    const filteredPods = selectedNamespace 
      ? pods.filter(p => p.namespace === selectedNamespace)
      : pods;
    const filteredDeployments = selectedNamespace
      ? deployments.filter(d => d.namespace === selectedNamespace)
      : deployments;
    const filteredDaemonSets = selectedNamespace
      ? daemonSets.filter(d => d.namespace === selectedNamespace)
      : daemonSets;

    switch (selectedResource) {
      case 'namespaces':
        return namespaces;
      case 'pods':
        return filter ? filteredPods.filter(p => p.name.includes(filter)) : filteredPods;
      case 'deployments':
        return filter ? filteredDeployments.filter(d => d.name.includes(filter)) : filteredDeployments;
      case 'daemonsets':
        return filter ? filteredDaemonSets.filter(d => d.name.includes(filter)) : filteredDaemonSets;
      default:
        return [];
    }
  };

  const currentResources = getCurrentResources();

  useEffect(() => {
    if (selectedIndex >= currentResources.length) {
      setSelectedIndex(Math.max(0, currentResources.length - 1));
    }
  }, [currentResources.length, selectedIndex]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, currentResources.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'n' && e.ctrlKey) {
      e.preventDefault();
      const resourceOrder: ResourceType[] = ['namespaces', 'pods', 'deployments', 'daemonsets'];
      const currentIndex = resourceOrder.indexOf(selectedResource);
      setSelectedResource(resourceOrder[(currentIndex + 1) % resourceOrder.length]);
      setSelectedIndex(0);
    } else if (e.key === 'p' && e.ctrlKey) {
      e.preventDefault();
      const resourceOrder: ResourceType[] = ['namespaces', 'pods', 'deployments', 'daemonsets'];
      const currentIndex = resourceOrder.indexOf(selectedResource);
      setSelectedResource(resourceOrder[(currentIndex - 1 + resourceOrder.length) % resourceOrder.length]);
      setSelectedIndex(0);
    } else if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const input = prompt('Filter:');
      if (input !== null) {
        setFilter(input);
      }
    } else if (e.key === 'Escape') {
      setFilter('');
      setSelectedNamespace(null);
    } else if (e.key === 't' && e.ctrlKey) {
      e.preventDefault();
      setShowTerminal(prev => !prev);
    }
  }, [selectedResource, currentResources.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const renderTable = () => {
    switch (selectedResource) {
      case 'namespaces':
        return (
          <table className="resource-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>STATUS</th>
                <th>AGE</th>
              </tr>
            </thead>
            <tbody>
              {(currentResources as Namespace[]).map((ns, idx) => (
                <tr
                  key={ns.name}
                  className={idx === selectedIndex ? 'selected' : ''}
                  onClick={() => {
                    setSelectedIndex(idx);
                    setSelectedNamespace(ns.name);
                    setSelectedResource('pods');
                  }}
                >
                  <td>{ns.name}</td>
                  <td><span className="status-active">{ns.status}</span></td>
                  <td>{ns.age}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      
      case 'pods':
        return (
          <table className="resource-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>READY</th>
                <th>STATUS</th>
                <th>RESTARTS</th>
                <th>AGE</th>
                <th>NODE</th>
              </tr>
            </thead>
            <tbody>
              {currentResources.map((pod, idx) => {
                const p = pod as Pod;
                const statusClass = p.error ? 'status-error' : p.status === 'Running' ? 'status-running' : 'status-pending';
                return (
                  <tr
                    key={p.name}
                    className={idx === selectedIndex ? 'selected' : ''}
                    onClick={() => setSelectedIndex(idx)}
                  >
                    <td>{p.name}</td>
                    <td>{p.ready}</td>
                    <td>
                      <span className={statusClass}>{p.status}</span>
                      {p.error && <span className="error-indicator"> ⚠</span>}
                    </td>
                    <td className={p.restarts > 0 ? 'restarts-warning' : ''}>{p.restarts}</td>
                    <td>{p.age}</td>
                    <td>{p.node || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      
      case 'deployments':
        return (
          <table className="resource-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>READY</th>
                <th>UP-TO-DATE</th>
                <th>AVAILABLE</th>
                <th>AGE</th>
              </tr>
            </thead>
            <tbody>
              {currentResources.map((deployment, idx) => {
                const d = deployment as Deployment;
                return (
                  <tr
                    key={d.name}
                    className={idx === selectedIndex ? 'selected' : ''}
                    onClick={() => setSelectedIndex(idx)}
                  >
                    <td>{d.name}</td>
                    <td>{d.ready}</td>
                    <td>{d.upToDate}</td>
                    <td>{d.available}</td>
                    <td>{d.age}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      
      case 'daemonsets':
        return (
          <table className="resource-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>DESIRED</th>
                <th>CURRENT</th>
                <th>READY</th>
                <th>UP-TO-DATE</th>
                <th>AVAILABLE</th>
                <th>AGE</th>
              </tr>
            </thead>
            <tbody>
              {currentResources.map((ds, idx) => {
                const d = ds as DaemonSet;
                return (
                  <tr
                    key={d.name}
                    className={idx === selectedIndex ? 'selected' : ''}
                    onClick={() => setSelectedIndex(idx)}
                  >
                    <td>{d.name}</td>
                    <td>{d.desired}</td>
                    <td>{d.current}</td>
                    <td>{d.ready}</td>
                    <td>{d.upToDate}</td>
                    <td>{d.available}</td>
                    <td>{d.age}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
    }
  };

  const getSelectedResourceDetails = () => {
    if (currentResources.length === 0 || selectedIndex >= currentResources.length) return null;
    const resource = currentResources[selectedIndex];
    
    if (selectedResource === 'pods') {
      const pod = resource as Pod;
      if (pod.error) {
        return (
          <div className="details-panel">
            <h3>Pod Details: {pod.name}</h3>
            <div className="details-content">
              <p><strong>Namespace:</strong> {pod.namespace}</p>
              <p><strong>Status:</strong> <span className="status-error">{pod.status}</span></p>
              <p><strong>Error Type:</strong> <span className="error-type">{pod.error}</span></p>
              <p><strong>Error Message:</strong></p>
              <pre className="error-message">{pod.errorMessage}</pre>
              <p><strong>Restarts:</strong> {pod.restarts}</p>
              <p><strong>Node:</strong> {pod.node || 'N/A'}</p>
            </div>
          </div>
        );
      }
    }
    
    return null;
  };

  const handleDeletePod = (name: string, namespace: string) => {
    setPods(prev => prev.filter(p => !(p.name === name && p.namespace === namespace)));
  };

  const handleDeleteDeployment = (name: string, namespace: string) => {
    setDeployments(prev => prev.filter(d => !(d.name === name && d.namespace === namespace)));
  };

  const handleDeleteDaemonSet = (name: string, namespace: string) => {
    setDaemonSets(prev => prev.filter(d => !(d.name === name && d.namespace === namespace)));
  };

  const handleDeleteNamespace = (name: string) => {
    setNamespaces(prev => prev.filter(n => n.name !== name));
    setPods(prev => prev.filter(p => p.namespace !== name));
    setDeployments(prev => prev.filter(d => d.namespace !== name));
    setDaemonSets(prev => prev.filter(d => d.namespace !== name));
    if (selectedNamespace === name) {
      setSelectedNamespace(null);
    }
  };

  return (
    <div className="app">
      <div className="header">
        <div className="header-left">
          <span className="app-title">🐶 K9s-like Cluster Viewer</span>
        </div>
        <div className="header-right">
          <span className="resource-tabs">
            <button
              className={selectedResource === 'namespaces' ? 'active' : ''}
              onClick={() => {
                setSelectedResource('namespaces');
                setSelectedIndex(0);
              }}
            >
              Namespaces
            </button>
            <button
              className={selectedResource === 'pods' ? 'active' : ''}
              onClick={() => {
                setSelectedResource('pods');
                setSelectedIndex(0);
              }}
            >
              Pods
            </button>
            <button
              className={selectedResource === 'deployments' ? 'active' : ''}
              onClick={() => {
                setSelectedResource('deployments');
                setSelectedIndex(0);
              }}
            >
              Deployments
            </button>
            <button
              className={selectedResource === 'daemonsets' ? 'active' : ''}
              onClick={() => {
                setSelectedResource('daemonsets');
                setSelectedIndex(0);
              }}
            >
              DaemonSets
            </button>
          </span>
          <button
            className={`terminal-toggle ${showTerminal ? 'active' : ''}`}
            onClick={() => setShowTerminal(prev => !prev)}
            title="Toggle Terminal (Ctrl+T)"
          >
            Terminal
          </button>
        </div>
      </div>
      
      <div className="status-bar">
        <span className="status-info">
          {selectedNamespace && `Namespace: ${selectedNamespace} | `}
          {selectedResource}: {currentResources.length} | 
          {selectedResource === 'pods' && ` Errors: ${pods.filter(p => p.error).length}`}
        </span>
        <span className="status-help">
          ↑↓ Navigate | Ctrl+N/P Switch Resource | / Filter | Esc Clear | Ctrl+T Terminal
        </span>
      </div>

      <div className={`content-wrapper ${showTerminal ? 'with-terminal' : ''}`}>
        <div className={`main-content ${showTerminal ? 'with-terminal' : ''}`}>
          <div className="table-container">
            {renderTable()}
          </div>
          {getSelectedResourceDetails()}
        </div>
        {showTerminal && (
          <div className="terminal-wrapper">
            <Terminal
              pods={pods}
              deployments={deployments}
              daemonSets={daemonSets}
              namespaces={namespaces}
              onDeletePod={handleDeletePod}
              onDeleteDeployment={handleDeleteDeployment}
              onDeleteDaemonSet={handleDeleteDaemonSet}
              onDeleteNamespace={handleDeleteNamespace}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

