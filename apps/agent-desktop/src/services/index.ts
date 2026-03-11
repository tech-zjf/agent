import { env } from '@/config/env';
import { HttpClient } from '@/lib/http';
import { AuditService } from './modules/audit';
import { CopilotService } from './modules/copilot';
import { KnowledgeService } from './modules/knowledge';
import { TicketsService } from './modules/tickets';

const agentApiClient = new HttpClient(env.agentApiBaseUrl);

class AgentApi {
    readonly knowledge: KnowledgeService;
    readonly copilot: CopilotService;
    readonly tickets: TicketsService;
    readonly audit: AuditService;

    constructor() {
        this.knowledge = new KnowledgeService(agentApiClient);
        this.copilot = new CopilotService(agentApiClient);
        this.tickets = new TicketsService(agentApiClient);
        this.audit = new AuditService(agentApiClient);
    }
}

export const $agentApi = new AgentApi();

export * from './modules/audit/interface';
export * from './modules/copilot/interface';
export * from './modules/knowledge/interface';
export * from './modules/tickets/interface';
