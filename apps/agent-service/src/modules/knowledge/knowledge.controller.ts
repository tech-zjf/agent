import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateKnowledgeArticleDto } from './dto/create-knowledge-article.dto';
import { KnowledgeService } from './knowledge.service';

@Controller('api/knowledge/articles')
export class KnowledgeController {
    constructor(private readonly knowledgeService: KnowledgeService) {}

    @Get()
    async listArticles() {
        return {
            data: await this.knowledgeService.listArticles(),
        };
    }

    @Get('search')
    async searchArticles(@Query('q') query = '') {
        return {
            data: await this.knowledgeService.searchArticles(query),
            query,
        };
    }

    @Post()
    async createArticle(@Body() dto: CreateKnowledgeArticleDto) {
        return {
            data: await this.knowledgeService.createArticle(dto),
        };
    }
}
