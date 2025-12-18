import { useState } from 'react';
import { Code, Eye, Play, X } from 'lucide-react';

interface Plugin {
  id: string;
  name: string;
  description: string;
  type: 'interface' | 'logic' | 'chat';
  ui?: any;
  logic?: any;
  code?: string;
  schema?: any;
}

interface PluginPreviewProps {
  plugin: Plugin;
  onClose: () => void;
  onPublish?: (pluginId: string) => void;
}

export default function PluginPreview({ plugin, onClose, onPublish }: PluginPreviewProps) {
  const [previewMode, setPreviewMode] = useState<'ui' | 'logic' | 'code'>('ui');

  const renderUIPreview = () => {
    if (!plugin.ui) {
      return (
        <div className="text-center py-12 text-gray-400">
          <Eye size={48} className="mx-auto mb-3 opacity-50" />
          <p>No UI configuration available</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <h3 className="text-sm font-bold text-white mb-2">Layout Type</h3>
          <p className="text-gray-300">{plugin.ui.layout?.type || 'Not configured'}</p>
        </div>

        {plugin.ui.components && plugin.ui.components.length > 0 && (
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <h3 className="text-sm font-bold text-white mb-3">Components</h3>
            <div className="space-y-2">
              {plugin.ui.components.map((comp: any, index: number) => (
                <div key={index} className="bg-gray-900 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{comp.type}</span>
                    {comp.field && (
                      <span className="text-xs text-gray-400">{comp.field}</span>
                    )}
                  </div>
                  {comp.label && (
                    <p className="text-sm text-gray-400 mt-1">{comp.label}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {plugin.ui.layout?.config && (
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <h3 className="text-sm font-bold text-white mb-2">Layout Config</h3>
            <pre className="text-xs text-gray-300 overflow-auto">
              {JSON.stringify(plugin.ui.layout.config, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  const renderLogicPreview = () => {
    if (!plugin.logic || !plugin.logic.blocks || plugin.logic.blocks.length === 0) {
      return (
        <div className="text-center py-12 text-gray-400">
          <Play size={48} className="mx-auto mb-3 opacity-50" />
          <p>No logic blocks configured</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <h3 className="text-sm font-bold text-white mb-3">Logic Blocks</h3>
          <div className="space-y-3">
            {plugin.logic.blocks.map((block: any, index: number) => (
              <div key={index} className="bg-gray-900 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{block.type}</span>
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">
                    Block {index + 1}
                  </span>
                </div>
                {block.config && (
                  <pre className="text-xs text-gray-400 overflow-auto mt-2">
                    {JSON.stringify(block.config, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>

        {plugin.logic.flow && Object.keys(plugin.logic.flow).length > 0 && (
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <h3 className="text-sm font-bold text-white mb-2">Execution Flow</h3>
            <pre className="text-xs text-gray-300 overflow-auto">
              {JSON.stringify(plugin.logic.flow, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  const renderCodePreview = () => {
    const generatedCode = plugin.code || generateCodeFromPlugin(plugin);

    return (
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
        <h3 className="text-sm font-bold text-white mb-3">Generated Code</h3>
        <pre className="text-xs text-gray-300 overflow-auto bg-gray-900 p-4 rounded-lg">
          {generatedCode}
        </pre>
      </div>
    );
  };

  const generateCodeFromPlugin = (plugin: Plugin): string => {
    return `// Auto-generated plugin: ${plugin.name}
// Type: ${plugin.type}
// Description: ${plugin.description}

export const ${plugin.name.replace(/\s+/g, '')} = {
  id: '${plugin.id}',
  name: '${plugin.name}',
  type: '${plugin.type}',

  // UI Configuration
  ui: ${JSON.stringify(plugin.ui, null, 2)},

  // Logic Configuration
  logic: ${JSON.stringify(plugin.logic, null, 2)},

  // Schema
  schema: ${JSON.stringify(plugin.schema, null, 2)},

  // Execute function
  execute: async (context) => {
    // Plugin execution logic here
    console.log('Executing plugin:', '${plugin.name}');
    return { success: true };
  }
};`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-gray-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-white">{plugin.name}</h2>
            <p className="text-gray-400 text-sm mt-1">{plugin.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setPreviewMode('ui')}
            className={`flex-1 px-6 py-3 font-medium transition-colors flex items-center justify-center gap-2 ${
              previewMode === 'ui'
                ? 'bg-gray-800 text-white border-b-2 border-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Eye size={18} />
            UI Preview
          </button>
          <button
            onClick={() => setPreviewMode('logic')}
            className={`flex-1 px-6 py-3 font-medium transition-colors flex items-center justify-center gap-2 ${
              previewMode === 'logic'
                ? 'bg-gray-800 text-white border-b-2 border-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Play size={18} />
            Logic Preview
          </button>
          <button
            onClick={() => setPreviewMode('code')}
            className={`flex-1 px-6 py-3 font-medium transition-colors flex items-center justify-center gap-2 ${
              previewMode === 'code'
                ? 'bg-gray-800 text-white border-b-2 border-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Code size={18} />
            Code Preview
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {previewMode === 'ui' && renderUIPreview()}
          {previewMode === 'logic' && renderLogicPreview()}
          {previewMode === 'code' && renderCodePreview()}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
          {onPublish && (
            <button
              onClick={() => onPublish(plugin.id)}
              className="px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-colors"
            >
              Publish Plugin
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
