import { Pod, Deployment, DaemonSet, Namespace, PodErrorType } from './types';

const namespaces = ['default', 'kube-system', 'production', 'staging', 'monitoring', 'logging'];
const podNames = [
  'web-server', 'api-gateway', 'auth-service', 'database-proxy', 'cache-service',
  'worker-pool', 'scheduler', 'notifier', 'analytics', 'frontend',
  'backend-api', 'message-queue', 'file-storage', 'search-engine', 'load-balancer'
];

const deploymentNames = [
  'web-deployment', 'api-deployment', 'auth-deployment', 'worker-deployment',
  'frontend-deployment', 'backend-deployment'
];

const daemonSetNames = [
  'fluentd', 'node-exporter', 'log-collector', 'network-proxy'
];

const errorTypes: PodErrorType[] = [
  'OOMKilled',
  'CPUThrottled',
  'ImagePullBackOff',
  'ErrImagePull',
  'Unschedulable',
  'CrashLoopBackOff',
  'ContainerCreating',
  'Init:Error'
];

const errorMessages: Record<PodErrorType, string> = {
  OOMKilled: 'Container killed due to memory limit',
  CPUThrottled: 'CPU throttling detected',
  ImagePullBackOff: 'Back-off pulling image "registry.example.com/image:v1.0"',
  ErrImagePull: 'Failed to pull image "registry.example.com/image:v1.0": network timeout',
  Unschedulable: '0/3 nodes are available: insufficient cpu, memory',
  CrashLoopBackOff: 'Back-off restarting failed container',
  ContainerCreating: 'Container is being created',
  'Init:Error': 'Init container failed with exit code 1'
};

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomAge(): string {
  const days = randomInt(0, 30);
  const hours = randomInt(0, 23);
  const minutes = randomInt(0, 59);
  
  if (days > 0) return `${days}d${hours}h`;
  if (hours > 0) return `${hours}h${minutes}m`;
  return `${minutes}m`;
}

function generatePod(namespace: string, _index: number): Pod {
  const baseName = randomChoice(podNames);
  const name = `${baseName}-${randomInt(1000, 9999)}-${randomInt(100, 999)}`;
  
  // 50% chance of having an error
  const hasError = Math.random() < 0.5;
  
  let status: Pod['status'] = 'Running';
  let restarts = 0;
  let error: PodErrorType | undefined;
  let errorMessage: string | undefined;
  
  if (hasError) {
    error = randomChoice(errorTypes);
    errorMessage = errorMessages[error];
    
    switch (error) {
      case 'OOMKilled':
        status = 'Failed';
        restarts = randomInt(3, 15);
        break;
      case 'CPUThrottled':
        status = 'Running';
        break;
      case 'ImagePullBackOff':
      case 'ErrImagePull':
        status = 'Pending';
        restarts = 0;
        break;
      case 'Unschedulable':
        status = 'Pending';
        break;
      case 'CrashLoopBackOff':
        status = 'CrashLoopBackOff';
        restarts = randomInt(5, 20);
        break;
      case 'ContainerCreating':
        status = 'Pending';
        break;
      case 'Init:Error':
        status = 'Pending';
        restarts = randomInt(1, 5);
        break;
    }
  } else {
    restarts = Math.random() < 0.2 ? randomInt(0, 2) : 0;
  }
  
  const ready = status === 'Running' && !error 
    ? `${randomInt(1, 2)}/2` 
    : status === 'Running' && error === 'CPUThrottled'
    ? '2/2'
    : '0/2';
  
  return {
    name,
    namespace,
    status,
    ready,
    restarts,
    age: randomAge(),
    node: `node-${randomInt(1, 3)}`,
    error,
    errorMessage
  };
}

export function generateNamespaces(): Namespace[] {
  return namespaces.map(name => ({
    name,
    status: 'Active',
    age: randomAge()
  }));
}

export function generatePods(): Pod[] {
  const pods: Pod[] = [];
  
  namespaces.forEach(namespace => {
    const podCount = randomInt(3, 8);
    for (let i = 0; i < podCount; i++) {
      pods.push(generatePod(namespace, i));
    }
  });
  
  return pods;
}

export function generateDeployments(): Deployment[] {
  const deployments: Deployment[] = [];
  
  namespaces.forEach(namespace => {
    const deploymentCount = randomInt(1, 3);
    for (let i = 0; i < deploymentCount; i++) {
      const name = `${randomChoice(deploymentNames)}-${randomInt(1, 5)}`;
      const replicas = randomInt(2, 5);
      const upToDate = randomInt(0, replicas);
      const available = randomInt(0, upToDate);
      
      deployments.push({
        name,
        namespace,
        ready: `${available}/${replicas}`,
        upToDate,
        available,
        age: randomAge()
      });
    }
  });
  
  return deployments;
}

export function generateDaemonSets(): DaemonSet[] {
  const daemonSets: DaemonSet[] = [];
  
  namespaces.forEach(namespace => {
    if (Math.random() < 0.4) {
      const name = randomChoice(daemonSetNames);
      const desired = 3; // Assuming 3 nodes
      const current = randomInt(2, desired);
      const ready = randomInt(1, current);
      const upToDate = current;
      const available = ready;
      
      daemonSets.push({
        name,
        namespace,
        desired,
        current,
        ready,
        upToDate,
        available,
        age: randomAge()
      });
    }
  });
  
  return daemonSets;
}

