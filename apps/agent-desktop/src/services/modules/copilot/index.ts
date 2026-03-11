import { HttpClient } from '@/lib/http';
import { DraftReplyPayload, DraftReplyResult } from './interface';

export class CopilotService {
    constructor(private readonly client: HttpClient) {}

    draftReply(payload: DraftReplyPayload) {
        return this.client.post<DraftReplyResult>('/api/copilot/draft-reply', { body: payload });
    }
}
