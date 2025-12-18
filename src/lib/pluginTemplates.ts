export interface UILayout {
  type: 'list' | 'card' | 'detail' | 'table' | 'form' | 'chat';
  config: Record<string, any>;
}

export interface LogicBlock {
  type: 'fetch' | 'transform' | 'conditional' | 'loop' | 'static' | 'render';
  config: Record<string, any>;
}

export const uiLayoutTemplates: Record<string, UILayout> = {
  list: {
    type: 'list',
    config: {
      itemLayout: 'vertical',
      showHeader: true,
      pagination: true,
      itemsPerPage: 10,
      sortable: true,
      filterable: true,
    },
  },
  card: {
    type: 'card',
    config: {
      columns: 3,
      gap: 16,
      responsive: true,
      showImage: true,
      showActions: true,
      cardPadding: 16,
    },
  },
  detail: {
    type: 'detail',
    config: {
      layout: 'horizontal',
      sections: ['header', 'body', 'footer'],
      showBreadcrumb: true,
      showBackButton: true,
    },
  },
  table: {
    type: 'table',
    config: {
      striped: true,
      hover: true,
      bordered: false,
      pagination: true,
      pageSize: 20,
      sortable: true,
      searchable: true,
      exportable: true,
    },
  },
  form: {
    type: 'form',
    config: {
      layout: 'vertical',
      validation: true,
      showLabels: true,
      showRequired: true,
      submitButton: true,
      resetButton: true,
      autoSave: false,
    },
  },
  chat: {
    type: 'chat',
    config: {
      showTimestamp: true,
      showAvatar: true,
      enableInput: true,
      enableAttachments: false,
      autoScroll: true,
      messageLimit: 100,
    },
  },
};

export const logicBlockTemplates: Record<string, LogicBlock> = {
  fetch: {
    type: 'fetch',
    config: {
      method: 'GET',
      url: '',
      headers: {},
      auth: false,
      cache: false,
      timeout: 30000,
    },
  },
  transform: {
    type: 'transform',
    config: {
      operation: 'map',
      fields: [],
      filters: [],
      sorting: null,
    },
  },
  conditional: {
    type: 'conditional',
    config: {
      condition: '',
      ifTrue: null,
      ifFalse: null,
    },
  },
  loop: {
    type: 'loop',
    config: {
      type: 'forEach',
      collection: '',
      operation: null,
    },
  },
  static: {
    type: 'static',
    config: {
      data: null,
    },
  },
  render: {
    type: 'render',
    config: {
      template: '',
      data: null,
    },
  },
};

export interface PluginTemplate {
  name: string;
  description: string;
  type: 'interface' | 'logic' | 'chat';
  ui?: {
    layout: UILayout;
    components: any[];
  };
  logic?: {
    blocks: LogicBlock[];
    flow: any;
  };
  schema?: any;
  settings?: any;
}

export const pluginTemplates: Record<string, PluginTemplate> = {
  productList: {
    name: 'Product List',
    description: 'Display products in a list layout',
    type: 'interface',
    ui: {
      layout: uiLayoutTemplates.list,
      components: [
        {
          type: 'text',
          field: 'name',
          label: 'Product Name',
          bold: true,
        },
        {
          type: 'text',
          field: 'price',
          label: 'Price',
          format: 'currency',
        },
        {
          type: 'image',
          field: 'image',
          size: 'thumbnail',
        },
      ],
    },
    logic: {
      blocks: [logicBlockTemplates.fetch],
      flow: {},
    },
    schema: {
      fields: {
        name: { type: 'string', required: true },
        price: { type: 'number', required: true },
        image: { type: 'string' },
      },
    },
  },
  dataForm: {
    name: 'Data Entry Form',
    description: 'Form for creating or editing data',
    type: 'interface',
    ui: {
      layout: uiLayoutTemplates.form,
      components: [
        {
          type: 'input',
          field: 'name',
          label: 'Name',
          required: true,
          validation: 'text',
        },
        {
          type: 'textarea',
          field: 'description',
          label: 'Description',
          rows: 4,
        },
        {
          type: 'select',
          field: 'category',
          label: 'Category',
          options: [],
        },
      ],
    },
    logic: {
      blocks: [
        {
          type: 'fetch',
          config: {
            method: 'POST',
            url: '/api/submit',
            headers: { 'Content-Type': 'application/json' },
          },
        },
      ],
      flow: {},
    },
  },
  chatInterface: {
    name: 'Chat Interface',
    description: 'Real-time chat interface',
    type: 'chat',
    ui: {
      layout: uiLayoutTemplates.chat,
      components: [
        {
          type: 'message',
          showSender: true,
          showTimestamp: true,
        },
        {
          type: 'input',
          placeholder: 'Type a message...',
          enableEmoji: true,
        },
      ],
    },
    logic: {
      blocks: [
        {
          type: 'fetch',
          config: {
            method: 'POST',
            url: '/api/chat',
          },
        },
      ],
      flow: {},
    },
  },
  dataTable: {
    name: 'Data Table',
    description: 'Sortable and filterable table',
    type: 'interface',
    ui: {
      layout: uiLayoutTemplates.table,
      components: [
        {
          type: 'column',
          field: 'id',
          label: 'ID',
          sortable: true,
        },
        {
          type: 'column',
          field: 'name',
          label: 'Name',
          sortable: true,
          searchable: true,
        },
        {
          type: 'column',
          field: 'status',
          label: 'Status',
          filterable: true,
        },
      ],
    },
    logic: {
      blocks: [logicBlockTemplates.fetch, logicBlockTemplates.transform],
      flow: {},
    },
  },
  dataTransform: {
    name: 'Data Transformer',
    description: 'Transform data from one format to another',
    type: 'logic',
    logic: {
      blocks: [
        logicBlockTemplates.fetch,
        logicBlockTemplates.transform,
        {
          type: 'fetch',
          config: {
            method: 'POST',
            url: '/api/output',
          },
        },
      ],
      flow: {
        steps: ['fetch', 'transform', 'output'],
      },
    },
  },
};

export const getTemplateByIntent = (intent: string, type: string): PluginTemplate | null => {
  if (intent === 'create_interface') {
    if (type === 'list') return pluginTemplates.productList;
    if (type === 'form') return pluginTemplates.dataForm;
    if (type === 'table') return pluginTemplates.dataTable;
    if (type === 'card') return pluginTemplates.productList;
  }
  if (intent === 'create_chat') {
    return pluginTemplates.chatInterface;
  }
  if (intent === 'create_logic') {
    return pluginTemplates.dataTransform;
  }
  return null;
};
