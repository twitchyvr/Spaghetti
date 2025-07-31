import React from 'react';
import { Handle, Position } from 'reactflow';
import { CheckSquare, Edit, Trash2, User, Clock } from 'lucide-react';

interface TaskNodeProps {
  data: {
    name: string;
    description?: string;
    properties: {
      taskType?: 'manual' | 'automated' | 'approval';
      assignedTo?: string;
      assignedToRole?: string;
      dueDate?: string;
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      estimatedDuration?: number;
    };
    onUpdate: (id: string, data: any) => void;
    onDelete: (id: string) => void;
  };
  id: string;
  selected: boolean;
}

export const TaskNode: React.FC<TaskNodeProps> = ({ data, id, selected }) => {
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

  const updateProperty = (key: string, value: any) => {
    setProperties(prev => ({ ...prev, [key]: value }));
  };

  const getPriorityColor = (priority: string = 'normal') => {
    switch (priority) {
      case 'low': return 'text-gray-500';
      case 'high': return 'text-orange-500';
      case 'urgent': return 'text-red-500';
      default: return 'text-blue-500';
    }
  };

  if (isEditing) {
    return (
      <div className="px-4 py-3 bg-white border-2 border-blue-500 rounded-lg shadow-lg min-w-[250px]">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-2 py-1 text-sm border rounded"
              placeholder="Task name"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-2 py-1 text-xs border rounded resize-none"
              placeholder="Task description"
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
              <select
                value={properties.taskType || 'manual'}
                onChange={(e) => updateProperty('taskType', e.target.value)}
                className="w-full px-2 py-1 text-xs border rounded"
              >
                <option value="manual">Manual</option>
                <option value="automated">Automated</option>
                <option value="approval">Approval</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={properties.priority || 'normal'}
                onChange={(e) => updateProperty('priority', e.target.value)}
                className="w-full px-2 py-1 text-xs border rounded"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Assigned To</label>
            <input
              type="text"
              value={properties.assignedTo || ''}
              onChange={(e) => updateProperty('assignedTo', e.target.value)}
              className="w-full px-2 py-1 text-xs border rounded"
              placeholder="User email or ID"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Estimated Duration (hours)</label>
            <input
              type="number"
              value={properties.estimatedDuration || ''}
              onChange={(e) => updateProperty('estimatedDuration', parseInt(e.target.value) || null)}
              className="w-full px-2 py-1 text-xs border rounded"
              placeholder="Hours"
              min="0.5"
              step="0.5"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
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
          className="w-3 h-3 !bg-blue-500"
        />
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 !bg-blue-500"
        />
      </div>
    );
  }

  return (
    <div className={`group relative px-4 py-3 bg-white border-2 border-blue-400 rounded-lg shadow-md min-w-[180px] ${
      selected ? 'ring-2 ring-blue-600' : ''
    }`}>
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <CheckSquare className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-gray-900 truncate">{data.name}</div>
            {data.description && (
              <div className="text-xs text-gray-600 mt-1 line-clamp-2">{data.description}</div>
            )}
          </div>
        </div>
        
        {/* Task metadata */}
        <div className="space-y-1">
          {data.properties.assignedTo && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <User className="w-3 h-3" />
              <span className="truncate">{data.properties.assignedTo}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            {data.properties.priority && (
              <span className={`text-xs font-medium ${getPriorityColor(data.properties.priority)}`}>
                {data.properties.priority.toUpperCase()}
              </span>
            )}
            
            {data.properties.estimatedDuration && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{data.properties.estimatedDuration}h</span>
              </div>
            )}
          </div>
          
          {data.properties.taskType && (
            <div className="text-xs text-gray-400 uppercase tracking-wide">
              {data.properties.taskType}
            </div>
          )}
        </div>
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
        className="w-3 h-3 !bg-blue-500 !border-blue-400"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-blue-500 !border-blue-400"
      />
    </div>
  );
};