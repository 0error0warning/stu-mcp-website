// Brand artwork: Lobe Icons (MIT), pinned to 8b7bbc433d38437fa2b0cca58ae896917162b812.
// Asset hashes, upstream URLs and verification notes: /brands/source.json.
// These are display choices for a copyable prompt, not live integrations.
export const CATALOG_VERIFIED_AT = '2026-10-26';
const ICON_SOURCE_ROOT = 'https://raw.githubusercontent.com/lobehub/lobe-icons/8b7bbc433d38437fa2b0cca58ae896917162b812/packages/static-svg/icons/';

export const AGENTS = [
  {
    id: 'codex', name: 'Codex', icon: '/brands/agents/codex-color.svg',
    description: 'OpenAI 编程 Agent', source: 'https://openai.com/codex/',
    promptTarget: true,
  },
  {
    id: 'claude-code', name: 'Claude Code', icon: '/brands/agents/claudecode-color.svg',
    description: 'Anthropic 编程 Agent', source: 'https://claude.com/product/claude-code',
    promptTarget: true,
  },
  {
    id: 'cursor', name: 'Cursor', icon: '/brands/agents/cursor.svg',
    description: 'AI 编程工作台', source: 'https://cursor.com/',
    promptTarget: true, monochrome: true,
  },
  {
    id: 'workbuddy', name: 'WorkBuddy', icon: '/brands/agents/workbuddy-color.svg',
    description: '腾讯 AI 办公工作台', source: 'https://www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Product-Guide',
    promptTarget: true,
  },
  {
    id: 'antigravity', name: 'Antigravity', icon: '/brands/agents/antigravity-color.svg',
    description: 'Google Agent 开发平台', source: 'https://www.antigravity.google/docs/agent/',
    promptTarget: true,
  },
  {
    id: 'cline', name: 'Cline', icon: '/brands/agents/cline.svg',
    description: '开源编程 Agent', source: 'https://cline.bot/',
    promptTarget: true, monochrome: true,
  },
  {
    id: 'opencode', name: 'OpenCode', icon: '/brands/agents/opencode.svg',
    description: '开源编程 Agent', source: 'https://opencode.ai/',
    promptTarget: true, monochrome: true,
  },
  {
    id: 'trae', name: 'TRAE', icon: '/brands/agents/trae-color.svg',
    description: 'AI 开发环境', source: 'https://www.trae.ai/',
    promptTarget: true,
  },
  {
    id: 'grok', name: 'Grok', icon: '/brands/agents/grok.svg',
    description: 'xAI 智能助手', source: 'https://grok.com/',
    promptTarget: false, monochrome: true,
  },
  {
    id: 'doubao', name: '豆包', icon: '/brands/agents/doubao-color.svg',
    description: '字节跳动 AI 智能助手', source: 'https://www.doubao.com/',
    promptTarget: false,
  },
].map((agent) => ({
  ...agent,
  iconSource: `${ICON_SOURCE_ROOT}${agent.icon.split('/').at(-1)}`,
  verifiedAt: CATALOG_VERIFIED_AT,
  verification: 'official-product-page',
}));

// One current high-capability general model per provider, verified from that
// provider's public docs. This list makes no claim about cross-provider rank
// or availability inside any particular Agent. It does not call a model API.
export const MODELS = [
  {
    id: 'gpt-6-astra', name: 'GPT-6 Astra', provider: 'OpenAI',
    icon: '/brands/agents/openai.svg', monochrome: true,
    source: 'https://developers.openai.com/api/docs/models', verifiedAt: CATALOG_VERIFIED_AT,
  },
  {
    id: 'claude-fable-5-1', name: 'Claude Fable 5.1', provider: 'Anthropic',
    icon: '/brands/agents/claude-color.svg',
    source: 'https://platform.claude.com/docs/en/models/overview', verifiedAt: CATALOG_VERIFIED_AT,
  },
  {
    id: 'gemini-4-argon', name: 'Gemini 4 Argon', provider: 'Google',
    icon: '/brands/agents/gemini-color.svg',
    source: 'https://ai.google.dev/gemini-api/docs/models', verifiedAt: CATALOG_VERIFIED_AT,
  },
  {
    id: 'grok-4.7', name: 'Grok 4.7', provider: 'xAI',
    icon: '/brands/agents/grok.svg', monochrome: true,
    source: 'https://docs.x.ai/developers/models', verifiedAt: CATALOG_VERIFIED_AT,
  },
  {
    id: 'deepseek-flash', name: 'DeepSeek V4.1 Flash', provider: 'DeepSeek',
    icon: '/brands/agents/deepseek-color.svg',
    source: 'https://api-docs.deepseek.com/quick_start/pricing/', verifiedAt: CATALOG_VERIFIED_AT,
  },
  {
    id: 'qwen3.8-max', name: 'Qwen3.8-Max', provider: '阿里云',
    icon: '/brands/agents/qwen-color.svg',
    source: 'https://help.aliyun.com/zh/model-studio/text-generation-model', verifiedAt: CATALOG_VERIFIED_AT,
  },
  {
    id: 'kimi-k3.1-pro', name: 'Kimi K3.1 Pro', provider: 'Moonshot AI',
    icon: '/brands/agents/kimi-color.svg',
    source: 'https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart', verifiedAt: CATALOG_VERIFIED_AT,
  },
  {
    id: 'doubao-seed-2-1-pro-260915', name: 'Doubao Seed 2.1 Pro', provider: '字节跳动',
    icon: '/brands/agents/doubao-color.svg',
    source: 'https://seed.bytedance.com/en/seed2_1', verifiedAt: CATALOG_VERIFIED_AT,
  },
];
