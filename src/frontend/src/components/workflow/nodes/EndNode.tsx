import React from 'react';
import { Handle, Position } from 'reactflow';
import { Square, Edit, Trash2 } from 'lucide-react';

interface EndNodeProps {
  data: {
    name: string;
    description?: string;
    properties: {
      endType?: 'success' | 'failure' | 'termination' | 'cancel';
      returnValue?: string;
      notifyOnEnd?: boolean;
      customAction?: string;
    };
    onUpdate: (id: string, data: any) => void;
    onDelete: (id: string) => void;
  };
  id: string;
  selected: boolean;
}

export const EndNode: React.FC<EndNodeProps> = ({ data, id, selected }) => {
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

  const getEndTypeColor = (endType: string = 'success') => {
    switch (endType) {
      case 'success': return 'from-green-400 to-green-500';
      case 'failure': return 'from-red-400 to-red-500';
      case 'cancel': return 'from-gray-400 to-gray-500';
      case 'termination': return 'from-orange-400 to-orange-500';
      default: return 'from-green-400 to-green-500';
    }
  };

  const getEndTypeIcon = (endType: string = 'success') => {
    switch (endType) {
      case 'success': return 'text-green-100';
      case 'failure': return 'text-red-100';
      case 'cancel': return 'text-gray-100';
      case 'termination': return 'text-orange-100';
      default: return 'text-green-100';
    }
  };

  if (isEditing) {
    return (
      <div className="px-4 py-3 bg-white border-2 border-red-500 rounded-lg shadow-lg min-w-[300px]">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-2 py-1 text-sm border rounded"
              placeholder="End node name"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-2 py-1 text-xs border rounded resize-none"
              placeholder="End node description"
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">End Type</label>
              <select
                value={properties.endType || 'success'}
                onChange={(e) => updateProperty('endType', e.target.value)}
                className="w-full px-2 py-1 text-xs border rounded"
              >
                <option value="success">Success</option>
                <option value="failure">Failure</option>
                <option value="cancel">Cancel</option>
                <option value="termination">Termination</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Return Value</label>
              <input
                type="text"
                value={properties.returnValue || ''}
                onChange={(e) => updateProperty('returnValue', e.target.value)}
                className="w-full px-2 py-1 text-xs border rounded"
                placeholder="Optional return value"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Custom Action</label>
            <input
              type="text"
              value={properties.customAction || ''}
              onChange={(e) => updateProperty('customAction', e.target.value)}
              className="w-full px-2 py-1 text-xs border rounded"
              placeholder="Custom action to execute"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="notifyOnEnd"
              checked={properties.notifyOnEnd || false}
              onChange={(e) => updateProperty('notifyOnEnd', e.target.checked)}
              className="rounded"
            />
            <label htmlFor="notifyOnEnd" className="text-xs text-gray-700">
              Send notification when workflow ends
            </label>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
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
          className="w-3 h-3 !bg-red-500"
        />
      </div>
    );
  }

  const endType = properties.endType || 'success';

  return (
    <div className={`group relative px-4 py-3 bg-gradient-to-r ${getEndTypeColor(endType)} text-white rounded-lg shadow-md min-w-[160px] ${
      selected ? 'ring-2 ring-red-600' : ''
    }`}>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Square className={`w-4 h-4 ${getEndTypeIcon(endType)}`} />
          <div className="flex-1">
            <div className="font-medium text-sm">{data.name}</div>
            {data.description && (
              <div className="text-xs opacity-90 mt-1">{data.description}</div>
            )}
          </div>
        </div>
        
        <div className="text-xs opacity-75 uppercase tracking-wide">
          {endType}
        </div>
        
        {properties.returnValue && (
          <div className="text-xs opacity-90">
            Returns: {properties.returnValue}
          </div>
        )}
        
        {properties.notifyOnEnd && (
          <div className="text-xs opacity-75">
            📧 Notification enabled
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
        className="w-3 h-3 !bg-white !border-red-500"
      />
    </div>
  );
};