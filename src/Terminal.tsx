import React, { useState, useRef, useEffect } from 'react';
import { Pod, Deployment, DaemonSet, Namespace } from './types';
import './Terminal.css';

interface TerminalOutput {
  type: 'command' | 'output' | 'error';
  content: string;
  timestamp?: string;
}

interface TerminalProps {
  pods: Pod[];
  deployments: Deployment[];
  daemonSets: DaemonSet[];
  namespaces: Namespace[];
  onDeletePod: (name: string, namespace: string) => void;
  onDeleteDeployment: (name: string, namespace: string) => void;
  onDeleteDaemonSet: (name: string, namespace: string) => void;
  onDeleteNamespace: (name: string) => void;
}

export default function Terminal({
  pods,
  deployments,
  daemonSets,
  namespaces,
  onDeletePod,
  onDeleteDeployment,
  onDeleteDaemonSet,
  onDeleteNamespace
}: TerminalProps) {
  const [output, setOutput] = useState<TerminalOutput[]>([
    { type: 'output', content: 'Kubernetes terminal ready. Type "kubectl" commands or "help" for usage.' }
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const addOutput = (type: TerminalOutput['type'], content: string) => {
    setOutput(prev => [...prev, { type, content, timestamp: new Date().toLocaleTimeString() }]);
  };

  const formatTable = (headers: string[], rows: string[][]): string => {
    const colWidths = headers.map((header, i) => {
      const maxWidth = Math.max(
        header.length,
        ...rows.map(row => (row[i] || '').toString().length)
      );
      return maxWidth + 2;
    });

    const formatRow = (cells: string[]) => {
      return cells.map((cell, i) => {
        const str = (cell || '').toString();
        return str.padEnd(colWidths[i]);
      }).join(' ');
    };

    const headerRow = formatRow(headers);
    const separator = headers.map((_, i) => '-'.repeat(colWidths[i] - 1)).join(' ');
    const dataRows = rows.map(formatRow);

    return [headerRow, separator, ...dataRows].join('\n');
  };

  const executeKubectlGet = (resource: string, namespace?: string, name?: string): string => {
    let resources: any[] = [];
    
    switch (resource.toLowerCase()) {
      case 'pods':
      case 'pod':
      case 'po':
        resources = namespace 
          ? pods.filter(p => p.namespace === namespace)
          : pods;
        if (name) {
          resources = resources.filter(p => p.name === name);
        }
        if (resources.length === 0) {
          return `No resources found${namespace ? ` in ${namespace} namespace` : ''}.`;
        }
        return formatTable(
          ['NAME', 'READY', 'STATUS', 'RESTARTS', 'AGE', 'NODE'],
          resources.map(p => [
            p.name,
            p.ready,
            p.status + (p.error ? ' ⚠' : ''),
            p.restarts.toString(),
            p.age,
            p.node || '-'
          ])
        );
      
      case 'deployments':
      case 'deployment':
      case 'deploy':
        resources = namespace
          ? deployments.filter(d => d.namespace === namespace)
          : deployments;
        if (name) {
          resources = resources.filter(d => d.name === name);
        }
        if (resources.length === 0) {
          return `No resources found${namespace ? ` in ${namespace} namespace` : ''}.`;
        }
        return formatTable(
          ['NAME', 'READY', 'UP-TO-DATE', 'AVAILABLE', 'AGE'],
          resources.map(d => [
            d.name,
            d.ready,
            d.upToDate.toString(),
            d.available.toString(),
            d.age
          ])
        );
      
      case 'daemonsets':
      case 'daemonset':
      case 'ds':
        resources = namespace
          ? daemonSets.filter(d => d.namespace === namespace)
          : daemonSets;
        if (name) {
          resources = resources.filter(d => d.name === name);
        }
        if (resources.length === 0) {
          return `No resources found${namespace ? ` in ${namespace} namespace` : ''}.`;
        }
        return formatTable(
          ['NAME', 'DESIRED', 'CURRENT', 'READY', 'UP-TO-DATE', 'AVAILABLE', 'AGE'],
          resources.map(d => [
            d.name,
            d.desired.toString(),
            d.current.toString(),
            d.ready.toString(),
            d.upToDate.toString(),
            d.available.toString(),
            d.age
          ])
        );
      
      case 'namespaces':
      case 'namespace':
      case 'ns':
        resources = namespaces;
        if (name) {
          resources = resources.filter(n => n.name === name);
        }
        if (resources.length === 0) {
          return 'No resources found.';
        }
        return formatTable(
          ['NAME', 'STATUS', 'AGE'],
          resources.map(n => [n.name, n.status, n.age])
        );
      
      default:
        return `Error: unknown resource type "${resource}". Use "kubectl api-resources" for a complete list.`;
    }
  };

  const executeKubectlDescribe = (resource: string, name: string, namespace?: string): string => {
    switch (resource.toLowerCase()) {
      case 'pod':
      case 'pods':
      case 'po': {
        const pod = pods.find(p => 
          p.name === name && (!namespace || p.namespace === namespace)
        );
        if (!pod) {
          return `Error from server (NotFound): pods "${name}" not found`;
        }
        return `Name:         ${pod.name}
Namespace:    ${pod.namespace}
Priority:     0
Node:         ${pod.node || '<none>'}
Start Time:   ${new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()}
Labels:       app=${pod.name.split('-')[0]}
Annotations:  <none>
Status:       ${pod.status}
IP:           10.244.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}
Containers:
  ${pod.name.split('-')[0]}:
    Container ID:   docker://${Math.random().toString(36).substring(7)}
    Image:          ${pod.name.split('-')[0]}:latest
    Image ID:       docker-pullable://${pod.name.split('-')[0]}@sha256:${Math.random().toString(36).substring(2, 18)}
    Port:           <none>
    Host Port:      <none>
    State:          ${pod.status === 'Running' ? 'Running' : 'Waiting'}
    Ready:          ${pod.ready.split('/')[0] === pod.ready.split('/')[1] ? 'True' : 'False'}
    Restart Count:  ${pod.restarts}
    Environment:    <none>
    Mounts:         <none>
Conditions:
  Type              Status
  Initialized       True
  Ready             ${pod.ready.split('/')[0] === pod.ready.split('/')[1] ? 'True' : 'False'}
  ContainersReady   ${pod.ready.split('/')[0] === pod.ready.split('/')[1] ? 'True' : 'False'}
  PodScheduled      True
${pod.error ? `Events:
  Type     Reason          Message
  Warning  ${pod.error}    ${pod.errorMessage || ''}
` : ''}`;
      }
      
      case 'deployment':
      case 'deployments':
      case 'deploy': {
        const deployment = deployments.find(d =>
          d.name === name && (!namespace || d.namespace === namespace)
        );
        if (!deployment) {
          return `Error from server (NotFound): deployments.apps "${name}" not found`;
        }
        return `Name:                   ${deployment.name}
Namespace:              ${deployment.namespace}
CreationTimestamp:      ${new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()}
Labels:                 app=${deployment.name.split('-')[0]}
Annotations:            deployment.kubernetes.io/revision: 1
Selector:               app=${deployment.name.split('-')[0]}
Replicas:               ${deployment.ready.split('/')[1]} desired | ${deployment.available} updated | ${deployment.available} total | ${deployment.upToDate} available | ${parseInt(deployment.ready.split('/')[0])} unavailable
StrategyType:           RollingUpdate
MinReadySeconds:        0
RollingUpdateStrategy:  25% max unavailable, 25% max surge
Pod Template:
  Labels:  app=${deployment.name.split('-')[0]}
  Containers:
   ${deployment.name.split('-')[0]}:
    Image:        ${deployment.name.split('-')[0]}:latest
    Port:         <none>
    Environment:  <none>
    Mounts:       <none>
  Volumes:        <none>
Conditions:
  Type           Status  Reason
  Available      True    MinimumReplicasAvailable
  Progressing    True    NewReplicaSetAvailable`;
      }
      
      case 'daemonset':
      case 'daemonsets':
      case 'ds': {
        const daemonSet = daemonSets.find(d =>
          d.name === name && (!namespace || d.namespace === namespace)
        );
        if (!daemonSet) {
          return `Error from server (NotFound): daemonsets.apps "${name}" not found`;
        }
        return `Name:           ${daemonSet.name}
Namespace:      ${daemonSet.namespace}
Selector:       app=${daemonSet.name}
Node-Selector:  <none>
Labels:         app=${daemonSet.name}
Annotations:    <none>
Desired Number of Nodes Scheduled: ${daemonSet.desired}
Current Number of Nodes Scheduled: ${daemonSet.current}
Number of Nodes Scheduled with Up-to-date Pods: ${daemonSet.upToDate}
Number of Nodes Scheduled with Ready Pods: ${daemonSet.ready}
Number of Nodes Misscheduled: ${daemonSet.desired - daemonSet.current}
Pods Status:   ${daemonSet.ready} Running / ${daemonSet.current - daemonSet.ready} Waiting / ${daemonSet.desired - daemonSet.current} Succeeded / 0 Failed`;
      }
      
      case 'namespace':
      case 'namespaces':
      case 'ns': {
        const ns = namespaces.find(n => n.name === name);
        if (!ns) {
          return `Error from server (NotFound): namespaces "${name}" not found`;
        }
        return `Name:         ${ns.name}
Labels:       <none>
Annotations:  <none>
Status:       ${ns.status}
No resource quota.
No resource limits.`;
      }
      
      default:
        return `Error: unknown resource type "${resource}".`;
    }
  };

  const executeKubectlDelete = (resource: string, name: string, namespace?: string): string => {
    switch (resource.toLowerCase()) {
      case 'pod':
      case 'pods':
      case 'po': {
        const pod = pods.find(p =>
          p.name === name && (!namespace || p.namespace === namespace)
        );
        if (!pod) {
          return `Error from server (NotFound): pods "${name}" not found`;
        }
        onDeletePod(name, pod.namespace);
        return `pod "${name}" deleted`;
      }
      
      case 'deployment':
      case 'deployments':
      case 'deploy': {
        const deployment = deployments.find(d =>
          d.name === name && (!namespace || d.namespace === namespace)
        );
        if (!deployment) {
          return `Error from server (NotFound): deployments.apps "${name}" not found`;
        }
        onDeleteDeployment(name, deployment.namespace);
        return `deployment.apps "${name}" deleted`;
      }
      
      case 'daemonset':
      case 'daemonsets':
      case 'ds': {
        const daemonSet = daemonSets.find(d =>
          d.name === name && (!namespace || d.namespace === namespace)
        );
        if (!daemonSet) {
          return `Error from server (NotFound): daemonsets.apps "${name}" not found`;
        }
        onDeleteDaemonSet(name, daemonSet.namespace);
        return `daemonset.apps "${name}" deleted`;
      }
      
      case 'namespace':
      case 'namespaces':
      case 'ns': {
        const ns = namespaces.find(n => n.name === name);
        if (!ns) {
          return `Error from server (NotFound): namespaces "${name}" not found`;
        }
        onDeleteNamespace(name);
        return `namespace "${name}" deleted`;
      }
      
      default:
        return `Error: unknown resource type "${resource}".`;
    }
  };

  const executeCommand = (cmd: string) => {
    addOutput('command', `$ ${cmd}`);
    
    const trimmed = cmd.trim();
    if (!trimmed) {
      return;
    }

    if (trimmed === 'help' || trimmed === '?') {
      addOutput('output', `Available commands:
  kubectl get <resource> [name] [-n namespace]
  kubectl describe <resource> <name> [-n namespace]
  kubectl delete <resource> <name> [-n namespace]
  kubectl apply -f <file> (simulated)
  
Resources: pods, deployments, daemonsets, namespaces
Shortcuts: po, deploy, ds, ns
  
Examples:
  kubectl get pods
  kubectl get pods -n default
  kubectl describe pod <pod-name>
  kubectl delete pod <pod-name> -n default
  kubectl get deployments
  kubectl get namespaces`);
      return;
    }

    if (trimmed.startsWith('kubectl ')) {
      const parts = trimmed.substring(8).trim().split(/\s+/);
      const command = parts[0];
      let namespace: string | undefined;
      let name: string | undefined;
      let resource: string | undefined;

      // Parse namespace flag
      const nsIndex = parts.indexOf('-n');
      if (nsIndex !== -1 && parts[nsIndex + 1]) {
        namespace = parts[nsIndex + 1];
        parts.splice(nsIndex, 2);
      }

      if (command === 'get') {
        resource = parts[1];
        name = parts[2];
        const result = executeKubectlGet(resource, namespace, name);
        addOutput('output', result);
      } else if (command === 'describe') {
        resource = parts[1];
        name = parts[2];
        if (!name) {
          addOutput('error', 'Error: resource name is required for describe command.');
          return;
        }
        const result = executeKubectlDescribe(resource, name, namespace);
        addOutput('output', result);
      } else if (command === 'delete') {
        resource = parts[1];
        name = parts[2];
        if (!name) {
          addOutput('error', 'Error: resource name is required for delete command.');
          return;
        }
        const result = executeKubectlDelete(resource, name, namespace);
        addOutput('output', result);
      } else if (command === 'apply') {
        addOutput('output', 'Note: This is a mock cluster. Apply command is simulated.\n' +
          'In a real cluster, this would apply the configuration from the specified file.');
      } else {
        addOutput('error', `Error: unknown kubectl command "${command}". Use "help" for available commands.`);
      }
    } else {
      addOutput('error', `Command not found: ${trimmed}. Type "help" for available commands.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setCommandHistory(prev => [...prev, input]);
    setHistoryIndex(-1);
    executeCommand(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    }
  };

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <span>Terminal</span>
        <span className="terminal-hint">Type kubectl commands or "help"</span>
      </div>
      <div className="terminal-output" ref={outputRef}>
        {output.map((item, idx) => (
          <div key={idx} className={`terminal-line terminal-line-${item.type}`}>
            {item.type === 'command' && <span className="terminal-prompt">$ </span>}
            <pre className="terminal-content">{item.content}</pre>
          </div>
        ))}
      </div>
      <form className="terminal-input-form" onSubmit={handleSubmit}>
        <span className="terminal-prompt">$ </span>
        <input
          ref={inputRef}
          type="text"
          className="terminal-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="kubectl get pods"
          autoFocus
        />
      </form>
    </div>
  );
}

