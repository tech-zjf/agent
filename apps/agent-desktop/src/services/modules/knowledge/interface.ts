export interface KnowledgeArticle {
    id: string;
    title: string;
    content: string;
    tags: string[];
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

export interface CreateKnowledgeArticlePayload {
    title: string;
    content: string;
    tags?: string[];
}
