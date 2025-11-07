export type PodStatus = 
  | 'Running'
  | 'Pending'
  | 'Failed'
  | 'Succeeded'
  | 'Unknown'
  | 'CrashLoopBackOff'
  | 'ImagePullBackOff'
  | 'ErrImagePull'
  | 'OOMKilled'
  | 'CPUThrottled';

export type PodErrorType =
  | 'OOMKilled'
  | 'CPUThrottled'
  | 'ImagePullBackOff'
  | 'ErrImagePull'
  | 'Unschedulable'
  | 'CrashLoopBackOff'
  | 'ContainerCreating'
  | 'Init:Error';

export interface Pod {
  name: string;
  namespace: string;
  status: PodStatus;
  ready: string;
  restarts: number;
  age: string;
  node?: string;
  error?: PodErrorType;
  errorMessage?: string;
}

export interface Deployment {
  name: string;
  namespace: string;
  ready: string;
  upToDate: number;
  available: number;
  age: string;
}

export interface DaemonSet {
  name: string;
  namespace: string;
  desired: number;
  current: number;
  ready: number;
  upToDate: number;
  available: number;
  age: string;
}

export interface Namespace {
  name: string;
  status: string;
  age: string;
}

export type ResourceType = 'namespaces' | 'pods' | 'deployments' | 'daemonsets';

