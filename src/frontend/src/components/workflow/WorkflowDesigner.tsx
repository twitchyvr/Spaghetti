import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  MiniMap,
  Background,
  NodeTypes,
  ConnectionMode,
  MarkerType,
} from 'reactflow';
import { Save, Play, Settings, Plus, Trash2, Copy } from 'lucide-react';
import 'reactflow/dist/style.css';

// Custom node types
import { StartNode } from './nodes/StartNode';
import { TaskNode } from './nodes/TaskNode';
import { DecisionNode } from './nodes/DecisionNode';
import { EndNode } from './nodes/EndNode';

interface WorkflowDesignerProps {
  workflowId?: string;
  initialWorkflow?: WorkflowDefinition;
  onSave: (workflow: WorkflowDefinition) => Promise<void>;
  onValidationError?: (errors: ValidationError[]) => void;
  readonly?: boolean;
  className?: string;
}

interface WorkflowDefinition {
  id?: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  settings: WorkflowSettings;
  variables: Record<string, any>;
}

interface WorkflowNode {
  id: string;
  type: 'start' | 'end' | 'task' | 'decision' | 'parallel' | 'wait';
  name: string;
  description?: string;
  position: { x: number; y: number };
  properties: Record<string, any>;
  inputPorts: string[];
  outputPorts: string[];
}

interface WorkflowConnection {
  id: string;
  sourceNodeId: string;
  sourcePort: string;
  targetNodeId: string;
  targetPort: string;
  label?: string;
  condition?: WorkflowCondition;
  properties: Record<string, any>;
}

interface WorkflowCondition {
  type: 'expression' | 'value' | 'script';
  expression: string;
  parameters: Record<string, any>;
}

interface WorkflowSettings {
  defaultTimeout?: number;
  maxRetries: number;
  allowParallelExecution: boolean;
  notificationEmail?: string;
  notificationChannels: string[];
  customSettings: Record<string, any>;
}

interface ValidationError {
  type: 'error' | 'warning';
  message: string;
  nodeId?: string;
  connectionId?: string;
}

const nodeTypes: NodeTypes = {
  start: StartNode,
  task: TaskNode,
  decision: DecisionNode,
  end: EndNode,
};

const defaultWorkflow: WorkflowDefinition = {
  name: 'New Workflow',
  description: '',
  nodes: [],
  connections: [],
  settings: {
    maxRetries: 3,
    allowParallelExecution: true,
    notificationChannels: [],
    customSettings: {}
  },
  variables: {}
};

export const WorkflowDesigner: React.FC<WorkflowDesignerProps> = ({
  workflowId,
  initialWorkflow = defaultWorkflow,
  onSave,
  onValidationError,
  readonly = false,
  className = ''
}) => {
  const [workflow, setWorkflow] = useState<WorkflowDefinition>(initialWorkflow);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<any>(null);

  // Initialize workflow from props
  React.useEffect(() => {
    if (initialWorkflow.nodes.length > 0) {
      const flowNodes = initialWorkflow.nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          name: node.name,
          description: node.description,
          properties: node.properties,
          onUpdate: (id: string, data: any) => updateNodeData(id, data),
          onDelete: (id: string) => deleteNode(id),
        },
        deletable: !readonly,
      }));

      const flowEdges = initialWorkflow.connections.map(conn => ({
        id: conn.id,
        source: conn.sourceNodeId,
        target: conn.targetNodeId,
        sourceHandle: conn.sourcePort,
        targetHandle: conn.targetPort,
        label: conn.label,
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        data: {
          condition: conn.condition,
          properties: conn.properties,
        },
        deletable: !readonly,
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    }
  }, [initialWorkflow, readonly]);

  // Handle connection creation
  const onConnect = useCallback(
    (params: Connection) => {
      if (readonly) return;
      
      const newEdge = {
        ...params,
        id: `edge-${Date.now()}`,
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        data: {
          condition: null,
          properties: {},
        },
      };
      
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [readonly, setEdges]
  );

  // Add new node
  const addNode = useCallback((nodeType: string) => {
    if (readonly) return;

    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!reactFlowBounds) return;

    const position = reactFlowInstance.current?.project({
      x: reactFlowBounds.width / 2,
      y: reactFlowBounds.height / 2,
    }) || { x: 250, y: 250 };

    const newNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position,
      data: {
        name: `New ${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}`,
        description: '',
        properties: getDefaultNodeProperties(nodeType),
        onUpdate: (id: string, data: any) => updateNodeData(id, data),
        onDelete: (id: string) => deleteNode(id),
      },
      deletable: true,
    };

    setNodes((nds) => nds.concat(newNode));
  }, [readonly, setNodes]);

  // Get default properties for node type
  const getDefaultNodeProperties = (nodeType: string): Record<string, any> => {
    switch (nodeType) {
      case 'task':
        return {
          taskType: 'manual',
          assignedTo: null,
          dueDate: null,
          priority: 'normal',
        };
      case 'decision':
        return {
          conditions: [],
          defaultPath: 'continue',
        };
      case 'wait':
        return {
          waitType: 'time',
          duration: 3600, // 1 hour in seconds
        };
      default:
        return {};
    }
  };

  // Update node data
  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
  }, [setNodes]);

  // Delete node
  const deleteNode = useCallback((nodeId: string) => {
    if (readonly) return;
    
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [readonly, setNodes, setEdges]);

  // Validate workflow
  const validateWorkflow = useCallback((): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Check for start node
    const startNodes = nodes.filter(node => node.type === 'start');
    if (startNodes.length === 0) {
      errors.push({
        type: 'error',
        message: 'Workflow must have at least one start node',
      });
    } else if (startNodes.length > 1) {
      errors.push({
        type: 'warning',
        message: 'Workflow has multiple start nodes',
      });
    }

    // Check for end node
    const endNodes = nodes.filter(node => node.type === 'end');
    if (endNodes.length === 0) {
      errors.push({
        type: 'error',
        message: 'Workflow must have at least one end node',
      });
    }

    // Check for isolated nodes
    nodes.forEach(node => {
      const hasIncoming = edges.some(edge => edge.target === node.id);
      const hasOutgoing = edges.some(edge => edge.source === node.id);
      
      if (!hasIncoming && node.type !== 'start') {
        errors.push({
          type: 'warning',
          message: `Node "${node.data.name}" has no incoming connections`,
          nodeId: node.id,
        });
      }
      
      if (!hasOutgoing && node.type !== 'end') {
        errors.push({
          type: 'warning',
          message: `Node "${node.data.name}" has no outgoing connections`,
          nodeId: node.id,
        });
      }
    });

    // Check for missing task assignments
    nodes.filter(node => node.type === 'task').forEach(node => {
      if (!node.data.properties?.assignedTo && !node.data.properties?.assignedToRole) {
        errors.push({
          type: 'warning',
          message: `Task "${node.data.name}" has no assignee`,
          nodeId: node.id,
        });
      }
    });

    return errors;
  }, [nodes, edges]);

  // Save workflow
  const handleSave = useCallback(async () => {
    if (readonly || isSaving) return;

    setIsSaving(true);
    setIsValidating(true);

    try {
      // Validate workflow
      const errors = validateWorkflow();
      setValidationErrors(errors);
      
      if (onValidationError) {
        onValidationError(errors);
      }

      // Don't save if there are critical errors
      const criticalErrors = errors.filter(e => e.type === 'error');
      if (criticalErrors.length > 0) {
        return;
      }

      // Convert ReactFlow nodes/edges to workflow definition
      const workflowDefinition: WorkflowDefinition = {
        ...workflow,
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type as any,
          name: node.data.name,
          description: node.data.description,
          position: node.position,
          properties: node.data.properties || {},
          inputPorts: ['input'],
          outputPorts: ['output'],
        })),
        connections: edges.map(edge => ({
          id: edge.id,
          sourceNodeId: edge.source,
          sourcePort: edge.sourceHandle || 'output',
          targetNodeId: edge.target,
          targetPort: edge.targetHandle || 'input',
          label: edge.label as string,
          condition: edge.data?.condition,
          properties: edge.data?.properties || {},
        })),
      };

      await onSave(workflowDefinition);
    } finally {
      setIsSaving(false);
      setIsValidating(false);
    }
  }, [readonly, isSaving, workflow, nodes, edges, validateWorkflow, onValidationError, onSave]);

  // Test workflow
  const handleTest = useCallback(async () => {
    // Implementation would depend on your backend testing capabilities
    console.log('Testing workflow...', { nodes, edges });
  }, [nodes, edges]);

  return (
    <div className={`workflow-designer h-full flex flex-col ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">{workflow.name}</h2>
          {validationErrors.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-sm text-red-600">
                {validationErrors.filter(e => e.type === 'error').length} errors,{' '}
                {validationErrors.filter(e => e.type === 'warning').length} warnings
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {!readonly && (
            <>
              {/* Node palette */}
              <div className="flex items-center gap-1 mr-4">
                <button
                  onClick={() => addNode('start')}
                  className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
                  title="Add Start Node"
                >
                  Start
                </button>
                <button
                  onClick={() => addNode('task')}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  title="Add Task Node"
                >
                  Task
                </button>
                <button
                  onClick={() => addNode('decision')}
                  className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                  title="Add Decision Node"
                >
                  Decision
                </button>
                <button
                  onClick={() => addNode('end')}
                  className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
                  title="Add End Node"
                >
                  End
                </button>
              </div>
              
              <button
                onClick={handleTest}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                <Play className="w-4 h-4" />
                Test
              </button>
            </>
          )}
          
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          
          {!readonly && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {/* Main designer area */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={(instance) => { reactFlowInstance.current = instance; }}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          attributionPosition="bottom-left"
        >
          <Background />
          <Controls />
          <MiniMap
            nodeStrokeColor={(n) => {
              switch (n.type) {
                case 'start': return '#10b981';
                case 'end': return '#ef4444';
                case 'task': return '#3b82f6';
                case 'decision': return '#f59e0b';
                default: return '#6b7280';
              }
            }}
            nodeColor={(n) => {
              switch (n.type) {
                case 'start': return '#dcfce7';
                case 'end': return '#fecaca';
                case 'task': return '#dbeafe';
                case 'decision': return '#fef3c7';
                default: return '#f3f4f6';
              }
            }}
            nodeBorderRadius={2}
          />
        </ReactFlow>
      </div>

      {/* Validation errors panel */}
      {validationErrors.length > 0 && (
        <div className="border-t bg-gray-50 p-4">
          <h3 className="text-sm font-medium mb-2">Validation Results</h3>
          <div className="space-y-1">
            {validationErrors.map((error, index) => (
              <div
                key={index}
                className={`text-sm flex items-center gap-2 ${
                  error.type === 'error' ? 'text-red-600' : 'text-yellow-600'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  error.type === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                {error.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};