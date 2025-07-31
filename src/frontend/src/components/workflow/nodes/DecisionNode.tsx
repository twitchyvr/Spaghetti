import React from 'react';
import { Handle, Position } from 'reactflow';
import { GitBranch, Edit, Trash2, Plus, X } from 'lucide-react';

interface DecisionNodeProps {
  data: {
    name: string;
    description?: string;
    properties: {
      conditions?: Array<{
        id: string;
        label: string;
        expression: string;
        type: 'expression' | 'value' | 'script';
      }>;
      defaultPath?: string;
    };
    onUpdate: (id: string, data: any) => void;
    onDelete: (id: string) => void;
  };
  id: string;
  selected?: boolean;
}

export const DecisionNode: React.FC<DecisionNodeProps> = ({ data, id, selected }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState(data.name);
  const [description, setDescription] = React.useState(data.description || '');
  const [properties, setProperties] = React.useState(data.properties);

  const handleSave = () => {
    data.onUpdate(id, { name, description, properties });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(data.name);
    setDescription(data.description || '');
    setProperties(data.properties);
    setIsEditing(false);
  };

  const addCondition = () => {
    const newCondition = {
      id: `condition-${Date.now()}`,
      label: 'New Condition',
      expression: 'true',
      type: 'expression' as const,
    };
    
    setProperties(prev => ({
      ...prev,
      conditions: [...(prev.conditions || []), newCondition]
    }));
  };

  const updateCondition = (conditionId: string, updates: Partial<typeof properties.conditions[0]>) => {
    setProperties(prev => ({
      ...prev,
      conditions: prev.conditions?.map(cond => 
        cond.id === conditionId ? { ...cond, ...updates } : cond
      ) || []
    }));
  };

  const removeCondition = (conditionId: string) => {
    setProperties(prev => ({
      ...prev,
      conditions: prev.conditions?.filter(cond => cond.id !== conditionId) || []
    }));
  };

  if (isEditing) {
    return (
      <div className="px-4 py-3 bg-white border-2 border-yellow-500 rounded-lg shadow-lg min-w-[300px]">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-2 py-1 text-sm border rounded"
              placeholder="Decision name"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-2 py-1 text-xs border rounded resize-none"
              placeholder="Decision description"
              rows={2}
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-gray-700">Conditions</label>
              <button
                onClick={addCondition}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {(properties.conditions || []).map((condition, index) => (
                <div key={condition.id} className="p-2 border rounded bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <input
                      type="text"
                      value={condition.label}
                      onChange={(e) => updateCondition(condition.id, { label: e.target.value })}
                      className="flex-1 px-2 py-1 text-xs border rounded mr-2"
                      placeholder="Condition label"
                    />
                    <button
                      onClick={() => removeCondition(condition.id)}
                      className="w-5 h-5 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <select
                      value={condition.type}
                      onChange={(e) => updateCondition(condition.id, { type: e.target.value as any })}
                      className="px-2 py-1 text-xs border rounded"
                    >
                      <option value="expression">Expression</option>
                      <option value="value">Value</option>
                      <option value="script">Script</option>
                    </select>
                    
                    <input
                      type="text"
                      value={condition.expression}
                      onChange={(e) => updateCondition(condition.id, { expression: e.target.value })}
                      className="flex-1 px-2 py-1 text-xs border rounded"
                      placeholder="Condition expression"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Default Path</label>
            <select
              value={properties.defaultPath || 'continue'}
              onChange={(e) => setProperties(prev => ({ ...prev, defaultPath: e.target.value }))}
              className="w-full px-2 py-1 text-xs border rounded"
            >
              <option value="continue">Continue</option>
              <option value="reject">Reject</option>
              <option value="escalate">Escalate</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
        
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 !bg-yellow-500"
        />
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 !bg-yellow-500"
          id="true"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 !bg-yellow-500"
          id="false"
        />
      </div>
    );
  }

  const conditionCount = properties.conditions?.length || 0;

  return (
    <div className={`group relative px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-lg shadow-md min-w-[160px] ${
      selected ? 'ring-2 ring-yellow-600' : ''
    }`}>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4" />
          <div className="flex-1">
            <div className="font-medium text-sm">{data.name}</div>
            {data.description && (
              <div className="text-xs opacity-90 mt-1">{data.description}</div>
            )}
          </div>
        </div>
        
        {conditionCount > 0 && (
          <div className="text-xs opacity-90">
            {conditionCount} condition{conditionCount !== 1 ? 's' : ''}
          </div>
        )}
        
        {properties.defaultPath && (
          <div className="text-xs opacity-75">
            Default: {properties.defaultPath}
          </div>
        )}
      </div>
      
      {/* Node controls */}
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button
          onClick={() => setIsEditing(true)}
          className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600"
          title="Edit"
        >
          <Edit className="w-3 h-3" />
        </button>
        <button
          onClick={() => data.onDelete(id)}
          className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
          title="Delete"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-white !border-yellow-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-white !border-yellow-500"
        id="true"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-white !border-yellow-500"
        id="false"
      />
    </div>
  );
};