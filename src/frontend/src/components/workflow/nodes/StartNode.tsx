import React from 'react';
import { Handle, Position } from 'reactflow';
import { Play, Edit, Trash2 } from 'lucide-react';

interface StartNodeProps {
  data: {
    name: string;
    description?: string;
    properties: Record<string, any>;
    onUpdate: (id: string, data: any) => void;
    onDelete: (id: string) => void;
  };
  id: string;
  selected: boolean;
}

export const StartNode: React.FC<StartNodeProps> = ({ data, id, selected }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState(data.name);
  const [description, setDescription] = React.useState(data.description || '');

  const handleSave = () => {
    data.onUpdate(id, { name, description });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(data.name);
    setDescription(data.description || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="px-4 py-3 bg-white border-2 border-green-500 rounded-lg shadow-lg min-w-[200px]">
        <div className="space-y-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-2 py-1 text-sm border rounded"
            placeholder="Node name"
            autoFocus
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded resize-none"
            placeholder="Description (optional)"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
        
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 !bg-green-500"
        />
      </div>
    );
  }

  return (
    <div className={`group relative px-4 py-3 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-lg shadow-md min-w-[150px] ${
      selected ? 'ring-2 ring-green-600' : ''
    }`}>
      <div className="flex items-center gap-2">
        <Play className="w-4 h-4" />
        <div className="flex-1">
          <div className="font-medium text-sm">{data.name}</div>
          {data.description && (
            <div className="text-xs opacity-90 mt-1">{data.description}</div>
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
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-white !border-green-500"
      />
    </div>
  );
};