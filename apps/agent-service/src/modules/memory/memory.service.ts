import { Injectable } from '@nestjs/common';
import { DataStoreService } from '../data-store/data-store.service';

@Injectable()
export class MemoryService {
    constructor(private readonly dataStore: DataStoreService) {}

    getCustomerMemory(customerId: string) {
        return this.dataStore.getCustomerMemory(customerId);
    }

    addCustomerFacts(customerId: string, facts: string[]) {
        const filteredFacts = facts
            .map((fact) => fact.trim())
            .filter((fact) => fact.length > 0)
            .slice(0, 20);

        return this.dataStore.upsertCustomerFacts(customerId, filteredFacts);
    }

    getConversationMemory(conversationId: string, customerId: string) {
        return this.dataStore.getConversationMemory(conversationId, customerId);
    }

    updateConversationMemory(conversationId: string, customerId: string, question: string, answerSummary: string) {
        return this.dataStore.updateConversationMemory(conversationId, customerId, question, answerSummary);
    }
}
