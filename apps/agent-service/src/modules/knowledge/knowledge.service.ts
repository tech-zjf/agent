import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DataStoreService } from '../data-store/data-store.service';
import { KnowledgeArticle } from '../shared/models';
import { CreateKnowledgeArticleDto } from './dto/create-knowledge-article.dto';

@Injectable()
export class KnowledgeService {
    constructor(private readonly dataStore: DataStoreService) {
        this.seedSampleArticles();
    }

    listArticles(): KnowledgeArticle[] {
        return this.dataStore.listArticles();
    }

    createArticle(dto: CreateKnowledgeArticleDto): KnowledgeArticle {
        const article: KnowledgeArticle = {
            id: randomUUID(),
            title: dto.title.trim(),
            content: dto.content.trim(),
            tags: dto.tags?.map((tag) => tag.trim()).filter(Boolean) ?? [],
            createdAt: new Date().toISOString(),
        };

        return this.dataStore.addArticle(article);
    }

    searchArticles(query: string): KnowledgeArticle[] {
        return this.dataStore.searchArticles(query);
    }

    private seedSampleArticles(): void {
        if (this.dataStore.listArticles().length > 0) {
            return;
        }

        this.createArticle({
            title: '退款政策',
            content: '标准订单在支付后7天内可申请原路退款。活动类或定制类商品不支持无理由退款。',
            tags: ['退款', '售后', '政策'],
        });

        this.createArticle({
            title: '发票开具说明',
            content: '企业用户可在订单完成后30天内申请电子发票。发票抬头与税号需与下单主体一致。',
            tags: ['发票', '财务'],
        });

        this.createArticle({
            title: '订单未发货处理',
            content: '若订单超过承诺发货时间，请先核对库存状态，再提供预计发货时间。无法履约时建议主动退款。',
            tags: ['订单', '物流', '发货'],
        });
    }
}
