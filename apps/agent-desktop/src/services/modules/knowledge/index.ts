import { HttpClient } from '@/lib/http';
import { CreateKnowledgeArticlePayload, KnowledgeArticle } from './interface';

export class KnowledgeService {
    constructor(private readonly client: HttpClient) {}

    list() {
        return this.client.get<KnowledgeArticle[]>('/api/knowledge/articles');
    }

    search(query: string) {
        return this.client.get<KnowledgeArticle[]>('/api/knowledge/articles/search', { query: { q: query } });
    }

    create(payload: CreateKnowledgeArticlePayload) {
        return this.client.post<KnowledgeArticle>('/api/knowledge/articles', { body: payload });
    }
}
