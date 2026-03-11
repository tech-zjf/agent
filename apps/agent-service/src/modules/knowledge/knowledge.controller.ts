import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateKnowledgeArticleDto } from './dto/create-knowledge-article.dto';
import { KnowledgeService } from './knowledge.service';

@Controller('api/knowledge/articles')
export class KnowledgeController {
    constructor(private readonly knowledgeService: KnowledgeService) {}

    @Get()
    async listArticles() {
        return this.knowledgeService.listArticles();
    }

    @Get('search')
    async searchArticles(@Query('q') query = '') {
        return this.knowledgeService.searchArticles(query);
    }

    @Post()
    async createArticle(@Body() dto: CreateKnowledgeArticleDto) {
        return this.knowledgeService.createArticle(dto);
    }
}
