
export enum AgentRole {
    ORCHESTRATOR = 'orchestrator',
    STRATEGIST = 'strategist',
    COPYWRITER = 'copywriter',
    DESIGNER = 'designer',
}

export interface AgentDefinition {
    id: AgentRole;
    name: string;
    description: string;
    avatar: string;
    color: string;
}

export const AGENT_REGISTRY: Record<AgentRole, AgentDefinition> = {
    [AgentRole.ORCHESTRATOR]: {
        id: AgentRole.ORCHESTRATOR,
        name: 'Ada (Orchestrator)',
        description: 'Project Manager who coordinates the team.',
        avatar: '/avatars/orchestrator.png',
        color: 'bg-purple-100 text-purple-700',
    },
    [AgentRole.STRATEGIST]: {
        id: AgentRole.STRATEGIST,
        name: 'Atlas (Strategist)',
        description: 'Content Strategist who plans the structure.',
        avatar: '/avatars/strategist.png',
        color: 'bg-blue-100 text-blue-700',
    },
    [AgentRole.COPYWRITER]: {
        id: AgentRole.COPYWRITER,
        name: 'Scribe (Copywriter)',
        description: 'Creative Writer who crafts the text.',
        avatar: '/avatars/copywriter.png',
        color: 'bg-green-100 text-green-700',
    },
    [AgentRole.DESIGNER]: {
        id: AgentRole.DESIGNER,
        name: 'Pixel (Designer)',
        description: 'Visual Designer who creates the layout.',
        avatar: '/avatars/designer.png',
        color: 'bg-pink-100 text-pink-700',
    },
};
