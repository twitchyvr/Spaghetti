import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { WorkflowDesigner } from '../WorkflowDesigner';
import { AuthContext } from '../../../contexts/AuthContext';

// Mock ReactFlow
vi.mock('reactflow', () => ({
  ReactFlow: ({ children, onNodesChange, onEdgesChange, onConnect, nodes, edges }: any) => (
    <div data-testid="react-flow">
      <div data-testid="nodes-count">{nodes?.length || 0}</div>
      <div data-testid="edges-count">{edges?.length || 0}</div>
      {children}
    </div>
  ),
  Background: () => <div data-testid="flow-background" />,
  Controls: () => <div data-testid="flow-controls" />,
  MiniMap: () => <div data-testid="flow-minimap" />,
  useNodesState: () => [[], vi.fn()],
  useEdgesState: () => [[], vi.fn()],
  addEdge: vi.fn(),
  MarkerType: { ArrowClosed: 'arrowclosed' },
}));

// Mock workflow service
vi.mock('../../../services/api', () => ({
  workflowApi: {
    createWorkflow: vi.fn(),
    updateWorkflow: vi.fn(),
    validateWorkflow: vi.fn(),
    getWorkflowTemplate: vi.fn(),
  },
}));

const mockUser = {
  id: 'user-123',
  name: 'Test User',
  email: 'test@example.com',
  role: 'workflow_designer',
  tenantId: 'tenant-123',
};

const mockAuthContext = {
  user: mockUser,
  login: vi.fn(),
  logout: vi.fn(),
  loading: false,
  isAuthenticated: true,
};

const renderWithAuthContext = (component: React.ReactElement) => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      {component}
    </AuthContext.Provider>
  );
};

describe('WorkflowDesigner', () => {
  const defaultProps = {
    workflowId: 'workflow-123',
    onSave: vi.fn(),
    onValidationChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders workflow designer interface', () => {
    renderWithAuthContext(<WorkflowDesigner {...defaultProps} />);
    
    expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    expect(screen.getByTestId('flow-background')).toBeInTheDocument();
    expect(screen.getByTestId('flow-controls')).toBeInTheDocument();
    expect(screen.getByTestId('flow-minimap')).toBeInTheDocument();
  });

  it('displays node palette with available node types', () => {
    renderWithAuthContext(<WorkflowDesigner {...defaultProps} />);
    
    expect(screen.getByText('Start Node')).toBeInTheDocument();
    expect(screen.getByText('Task Node')).toBeInTheDocument();
    expect(screen.getByText('Decision Node')).toBeInTheDocument();
    expect(screen.getByText('End Node')).toBeInTheDocument();
  });

  it('allows adding nodes via drag and drop', async () => {
    renderWithAuthContext(<WorkflowDesigner {...defaultProps} />);
    
    const startNodePalette = screen.getByText('Start Node');
    const canvas = screen.getByTestId('react-flow');
    
    // Simulate drag and drop
    fireEvent.dragStart(startNodePalette);
    fireEvent.dragOver(canvas);
    fireEvent.drop(canvas);
    
    await waitFor(() => {
      expect(screen.getByTestId('nodes-count')).toHaveTextContent('1');
    });
  });

  it('validates workflow configuration', async () => {
    const mockValidate = vi.fn().mockResolvedValue({
      isValid: false,
      errors: [
        { type: 'error', message: 'Workflow must have exactly one start node' },
        { type: 'warning', message: 'No end nodes detected' },
      ],
    });
    
    const { workflowApi } = await import('../../../services/api');
    (workflowApi.validateWorkflow as any).mockImplementation(mockValidate);
    
    renderWithAuthContext(<WorkflowDesigner {...defaultProps} />);
    
    const validateButton = screen.getByRole('button', { name: /validate workflow/i });
    fireEvent.click(validateButton);
    
    await waitFor(() => {
      expect(screen.getByText('Workflow must have exactly one start node')).toBeInTheDocument();
      expect(screen.getByText('No end nodes detected')).toBeInTheDocument();
    });
    
    expect(defaultProps.onValidationChange).toHaveBeenCalledWith({
      isValid: false,
      errors: expect.arrayContaining([
        expect.objectContaining({ message: 'Workflow must have exactly one start node' }),
      ]),
    });
  });

  it('supports node configuration through property panel', async () => {
    renderWithAuthContext(<WorkflowDesigner {...defaultProps} />);
    
    // Add a task node first
    const taskNodePalette = screen.getByText('Task Node');
    fireEvent.click(taskNodePalette);
    
    await waitFor(() => {
      expect(screen.getByTestId('nodes-count')).toHaveTextContent('1');
    });
    
    // Select the node to open property panel
    const nodeElement = screen.getByTestId('react-flow');
    fireEvent.click(nodeElement);
    
    await waitFor(() => {
      expect(screen.getByText('Node Properties')).toBeInTheDocument();
      expect(screen.getByLabelText('Task Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Assigned To')).toBeInTheDocument();
      expect(screen.getByLabelText('Due Date')).toBeInTheDocument();
    });
  });

  it('handles node connections correctly', async () => {
    renderWithAuthContext(<WorkflowDesigner {...defaultProps} />);
    
    // Add start and task nodes
    const startNode = screen.getByText('Start Node');
    const taskNode = screen.getByText('Task Node');
    
    fireEvent.click(startNode);
    fireEvent.click(taskNode);
    
    await waitFor(() => {
      expect(screen.getByTestId('nodes-count')).toHaveTextContent('2');
    });
    
    // Simulate connecting nodes (this would be handled by ReactFlow in reality)
    const canvas = screen.getByTestId('react-flow');
    fireEvent.click(canvas); // Select first node
    fireEvent.keyDown(canvas, { key: 'c', ctrlKey: true }); // Connect mode
    fireEvent.click(canvas); // Select second node
    
    await waitFor(() => {
      expect(screen.getByTestId('edges-count')).toHaveTextContent('1');
    });
  });

  it('provides workflow templates', async () => {
    const mockTemplate = {
      id: 'approval-template',
      name: 'Document Approval Workflow',
      description: 'Standard document approval process',
      nodes: [
        { id: 'start', type: 'start', position: { x: 100, y: 100 } },
        { id: 'review', type: 'task', position: { x: 300, y: 100 }, data: { label: 'Review Document' } },
        { id: 'approve', type: 'decision', position: { x: 500, y: 100 }, data: { label: 'Approve?' } },
        { id: 'end', type: 'end', position: { x: 700, y: 100 } },
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'review' },
        { id: 'e2', source: 'review', target: 'approve' },
        { id: 'e3', source: 'approve', target: 'end', label: 'Yes' },
      ],
    };
    
    const { workflowApi } = await import('../../../services/api');
    (workflowApi.getWorkflowTemplate as any).mockResolvedValue(mockTemplate);
    
    renderWithAuthContext(<WorkflowDesigner {...defaultProps} />);
    
    const templatesButton = screen.getByRole('button', { name: /templates/i });
    fireEvent.click(templatesButton);
    
    await waitFor(() => {
      expect(screen.getByText('Document Approval Workflow')).toBeInTheDocument();
    });
    
    const useTemplateButton = screen.getByRole('button', { name: /use template/i });
    fireEvent.click(useTemplateButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('nodes-count')).toHaveTextContent('4');
      expect(screen.getByTestId('edges-count')).toHaveTextContent('3');
    });
  });

  it('saves workflow with proper validation', async () => {
    const mockSave = vi.fn().mockResolvedValue({ id: 'workflow-123', version: 2 });
    const { workflowApi } = await import('../../../services/api');
    (workflowApi.updateWorkflow as any).mockImplementation(mockSave);
    
    renderWithAuthContext(<WorkflowDesigner {...defaultProps} />);
    
    // Add some nodes
    const startNode = screen.getByText('Start Node');
    const endNode = screen.getByText('End Node');
    
    fireEvent.click(startNode);
    fireEvent.click(endNode);
    
    await waitFor(() => {
      expect(screen.getByTestId('nodes-count')).toHaveTextContent('2');
    });
    
    const saveButton = screen.getByRole('button', { name: /save workflow/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith('workflow-123', {
        nodes: expect.arrayContaining([
          expect.objectContaining({ type: 'start' }),
          expect.objectContaining({ type: 'end' }),
        ]),
        edges: expect.any(Array),
        metadata: expect.objectContaining({
          lastModified: expect.any(Date),
          modifiedBy: 'user-123',
        }),
      });
    });
    
    expect(defaultProps.onSave).toHaveBeenCalledWith({
      id: 'workflow-123',
      version: 2,
    });
  });

  it('handles complex decision node branching', async () => {
    renderWithAuthContext(<WorkflowDesigner {...defaultProps} />);
    
    // Add decision node
    const decisionNode = screen.getByText('Decision Node');
    fireEvent.click(decisionNode);
    
    await waitFor(() => {
      expect(screen.getByTestId('nodes-count')).toHaveTextContent('1');
    });
    
    // Configure decision node
    const canvas = screen.getByTestId('react-flow');
    fireEvent.click(canvas); // Select decision node
    
    await waitFor(() => {
      expect(screen.getByText('Decision Properties')).toBeInTheDocument();
    });
    
    // Add condition
    const addConditionButton = screen.getByRole('button', { name: /add condition/i });
    fireEvent.click(addConditionButton);
    
    const conditionInput = screen.getByLabelText('Condition Expression');
    fireEvent.change(conditionInput, { target: { value: 'amount > 1000' } });
    
    const labelInput = screen.getByLabelText('Branch Label');
    fireEvent.change(labelInput, { target: { value: 'High Value' } });
    
    const saveConditionButton = screen.getByRole('button', { name: /save condition/i });
    fireEvent.click(saveConditionButton);
    
    await waitFor(() => {
      expect(screen.getByText('High Value')).toBeInTheDocument();
    });
  });

  it('supports workflow testing simulation', async () => {
    renderWithAuthContext(<WorkflowDesigner {...defaultProps} />);
    
    // Create a simple workflow
    const startNode = screen.getByText('Start Node');
    const taskNode = screen.getByText('Task Node');
    const endNode = screen.getByText('End Node');
    
    fireEvent.click(startNode);
    fireEvent.click(taskNode);
    fireEvent.click(endNode);
    
    await waitFor(() => {
      expect(screen.getByTestId('nodes-count')).toHaveTextContent('3');
    });
    
    const testButton = screen.getByRole('button', { name: /test workflow/i });
    fireEvent.click(testButton);
    
    await waitFor(() => {
      expect(screen.getByText('Workflow Test Mode')).toBeInTheDocument();
      expect(screen.getByText('Simulation Controls')).toBeInTheDocument();
    });
    
    const startSimulationButton = screen.getByRole('button', { name: /start simulation/i });
    fireEvent.click(startSimulationButton);
    
    await waitFor(() => {
      expect(screen.getByText('Current Step: Start')).toBeInTheDocument();
    });
  });

  it('handles workflow version management', async () => {
    const mockWorkflowVersions = [
      { version: 1, createdAt: '2024-01-01', createdBy: 'User A', description: 'Initial version' },
      { version: 2, createdAt: '2024-01-15', createdBy: 'User B', description: 'Added approval step' },
      { version: 3, createdAt: '2024-02-01', createdBy: 'Test User', description: 'Current version' },
    ];
    
    renderWithAuthContext(<WorkflowDesigner {...defaultProps} />);
    
    const versionsButton = screen.getByRole('button', { name: /versions/i });
    fireEvent.click(versionsButton);
    
    await waitFor(() => {
      expect(screen.getByText('Version History')).toBeInTheDocument();
      expect(screen.getByText('Version 1')).toBeInTheDocument();
      expect(screen.getByText('Version 2')).toBeInTheDocument();
      expect(screen.getByText('Version 3')).toBeInTheDocument();
    });
    
    const compareButton = screen.getByRole('button', { name: /compare with previous/i });
    fireEvent.click(compareButton);
    
    await waitFor(() => {
      expect(screen.getByText('Version Comparison')).toBeInTheDocument();
    });
  });
});