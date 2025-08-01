import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Play, 
  Square, 
  Brain, 
  Webhook, 
  Database, 
  GitBranch, 
  Clock,
  Zap,
  Save
} from 'lucide-react';

// Custom Node Types
const CustomStartNode = ({ data }: any) => (
  <div className="px-4 py-2 shadow-lg rounded-lg bg-green-100 border-2 border-green-300">
    <div className="flex items-center">
      <Play className="h-4 w-4 text-green-600 mr-2" />
      <div className="text-sm font-semibold text-green-800">{data.label}</div>
    </div>
  </div>
);

const CustomMLNode = ({ data }: any) => (
  <div className="px-4 py-3 shadow-lg rounded-lg bg-purple-100 border-2 border-purple-300 min-w-[200px]">
    <div className="flex items-center mb-2">
      <Brain className="h-4 w-4 text-purple-600 mr-2" />
      <div className="text-sm font-semibold text-purple-800">{data.label}</div>
    </div>
    <div className="text-xs text-purple-600">
      Model: {data.model || 'Document Classifier'}
    </div>
    <div className="text-xs text-purple-600">
      Confidence: {data.confidence || '> 90%'}
    </div>
  </div>
);

const CustomAPINode = ({ data }: any) => (
  <div className="px-4 py-3 shadow-lg rounded-lg bg-blue-100 border-2 border-blue-300 min-w-[180px]">
    <div className="flex items-center mb-2">
      <Webhook className="h-4 w-4 text-blue-600 mr-2" />
      <div className="text-sm font-semibold text-blue-800">{data.label}</div>
    </div>
    <div className="text-xs text-blue-600">
      Endpoint: {data.endpoint || '/api/external'}
    </div>
    <div className="text-xs text-blue-600">
      Method: {data.method || 'POST'}
    </div>
  </div>
);

const CustomDecisionNode = ({ data }: any) => (
  <div className="px-4 py-3 shadow-lg rounded-lg bg-yellow-100 border-2 border-yellow-300 min-w-[150px]">
    <div className="flex items-center mb-2">
      <GitBranch className="h-4 w-4 text-yellow-600 mr-2" />
      <div className="text-sm font-semibold text-yellow-800">{data.label}</div>
    </div>
    <div className="text-xs text-yellow-600">
      Condition: {data.condition || 'if confidence > 80%'}
    </div>
  </div>
);

const CustomEndNode = ({ data }: any) => (
  <div className="px-4 py-2 shadow-lg rounded-lg bg-red-100 border-2 border-red-300">
    <div className="flex items-center">
      <Square className="h-4 w-4 text-red-600 mr-2" />
      <div className="text-sm font-semibold text-red-800">{data.label}</div>
    </div>
  </div>
);

const nodeTypes = {
  startNode: CustomStartNode,
  mlNode: CustomMLNode,
  apiNode: CustomAPINode,
  decisionNode: CustomDecisionNode,
  endNode: CustomEndNode,
};

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
  category: string;
}

const AdvancedWorkflowDesigner: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  // const [selectedNodeType, setSelectedNodeType] = useState<string>('mlNode');
  const [isRunning, setIsRunning] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const workflowTemplates: WorkflowTemplate[] = [
    {
      id: 'document-processing',
      name: 'AI Document Processing',
      description: 'Automated document classification and routing workflow',
      category: 'AI/ML',
      nodes: [
        {
          id: 'start',
          type: 'startNode',
          position: { x: 100, y: 100 },
          data: { label: 'Document Uploaded' }
        },
        {
          id: 'classify',
          type: 'mlNode',
          position: { x: 300, y: 100 },
          data: { 
            label: 'Document Classification',
            model: 'BERT Classifier',
            confidence: '> 90%'
          }
        },
        {
          id: 'decision',
          type: 'decisionNode',
          position: { x: 550, y: 100 },
          data: { 
            label: 'High Confidence?',
            condition: 'confidence > 0.9'
          }
        },
        {
          id: 'auto-route',
          type: 'apiNode',
          position: { x: 750, y: 50 },
          data: { 
            label: 'Auto Route',
            endpoint: '/api/route-document',
            method: 'POST'
          }
        },
        {
          id: 'manual-review',
          type: 'apiNode',
          position: { x: 750, y: 150 },
          data: { 
            label: 'Manual Review',
            endpoint: '/api/manual-review',
            method: 'POST'
          }
        },
        {
          id: 'end',
          type: 'endNode',
          position: { x: 950, y: 100 },
          data: { label: 'Processing Complete' }
        }
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'classify' },
        { id: 'e2', source: 'classify', target: 'decision' },
        { id: 'e3', source: 'decision', target: 'auto-route', label: 'Yes' },
        { id: 'e4', source: 'decision', target: 'manual-review', label: 'No' },
        { id: 'e5', source: 'auto-route', target: 'end' },
        { id: 'e6', source: 'manual-review', target: 'end' }
      ]
    },
    {
      id: 'compliance-workflow',
      name: 'Compliance Automation',
      description: 'Automated compliance checking and approval workflow',
      category: 'Compliance',
      nodes: [
        {
          id: 'start',
          type: 'startNode',
          position: { x: 100, y: 100 },
          data: { label: 'Document Submitted' }
        },
        {
          id: 'compliance-check',
          type: 'mlNode',
          position: { x: 300, y: 100 },
          data: { 
            label: 'Compliance Analysis',
            model: 'Compliance Checker',
            confidence: '> 85%'
          }
        },
        {
          id: 'risk-assessment',
          type: 'mlNode',
          position: { x: 500, y: 100 },
          data: { 
            label: 'Risk Assessment',
            model: 'Risk Analyzer',
            confidence: '> 85%'
          }
        },
        {
          id: 'approval-routing',
          type: 'apiNode',
          position: { x: 700, y: 100 },
          data: { 
            label: 'Route for Approval',
            endpoint: '/api/route-approval',
            method: 'POST'
          }
        },
        {
          id: 'end',
          type: 'endNode',
          position: { x: 900, y: 100 },
          data: { label: 'Approval Routed' }
        }
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'compliance-check' },
        { id: 'e2', source: 'compliance-check', target: 'risk-assessment' },
        { id: 'e3', source: 'risk-assessment', target: 'approval-routing' },
        { id: 'e4', source: 'approval-routing', target: 'end' }
      ]
    }
  ];

  const nodeTypesConfig = [
    { id: 'startNode', label: 'Start', icon: Play, color: 'text-green-600' },
    { id: 'mlNode', label: 'ML Model', icon: Brain, color: 'text-purple-600' },
    { id: 'apiNode', label: 'API Call', icon: Webhook, color: 'text-blue-600' },
    { id: 'decisionNode', label: 'Decision', icon: GitBranch, color: 'text-yellow-600' },
    { id: 'endNode', label: 'End', icon: Square, color: 'text-red-600' },
  ];

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type || !reactFlowBounds) {
        return;
      }

      const position = reactFlowInstance?.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { 
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
          ...(type === 'mlNode' && { model: 'Custom Model', confidence: '> 85%' }),
          ...(type === 'apiNode' && { endpoint: '/api/custom', method: 'POST' }),
          ...(type === 'decisionNode' && { condition: 'custom condition' })
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const loadTemplate = (template: WorkflowTemplate) => {
    setNodes(template.nodes);
    setEdges(template.edges);
    setShowTemplates(false);
  };

  const runWorkflow = async () => {
    setIsRunning(true);
    
    // Simulate workflow execution
    for (let i = 0; i < nodes.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Could highlight current node here
    }
    
    setIsRunning(false);
  };

  const saveWorkflow = () => {
    const workflow = {
      nodes,
      edges,
      timestamp: new Date().toISOString()
    };
    
    // In a real app, this would save to backend
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.click();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Zap className="h-6 w-6 text-indigo-600 mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">Advanced Workflow Designer</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowTemplates(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Database className="h-4 w-4 mr-2" />
              Templates
            </button>
            <button
              onClick={saveWorkflow}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </button>
            <button
              onClick={runWorkflow}
              disabled={isRunning || nodes.length === 0}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isRunning || nodes.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isRunning ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Workflow
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Node Palette */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Node Types</h3>
          <div className="space-y-2">
            {nodeTypesConfig.map((nodeType) => {
              const Icon = nodeType.icon;
              return (
                <div
                  key={nodeType.id}
                  className="flex items-center p-3 border border-gray-200 rounded-lg cursor-move hover:bg-gray-50 transition-colors"
                  onDragStart={(event) => onDragStart(event, nodeType.id)}
                  draggable
                >
                  <Icon className={`h-5 w-5 mr-3 ${nodeType.color}`} />
                  <span className="text-sm font-medium text-gray-700">{nodeType.label}</span>
                </div>
              );
            })}
          </div>

          {/* Workflow Statistics */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Workflow Stats</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Nodes: {nodes.length}</div>
              <div>Connections: {edges.length}</div>
              <div>Complexity: {nodes.length > 10 ? 'High' : nodes.length > 5 ? 'Medium' : 'Low'}</div>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background gap={12} size={1} />
            <Panel position="top-right">
              <div className="bg-white p-3 rounded-lg shadow-lg">
                <div className="text-sm text-gray-600">
                  Drag nodes from the palette to create your workflow
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>

      {/* Template Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Workflow Templates</h2>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workflowTemplates.map((template) => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                        {template.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {template.nodes.length} nodes, {template.edges.length} connections
                    </div>
                    <button
                      onClick={() => loadTemplate(template)}
                      className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Load Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedWorkflowDesigner;