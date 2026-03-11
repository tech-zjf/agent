import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateKnowledgeArticleDto } from './dto/create-knowledge-article.dto';
import { KnowledgeService } from './knowledge.service';

@Controller('api/knowledge/articles')
export class KnowledgeController {
    constructor(private readonly knowledgeService: KnowledgeService) {}

    @Get()
    listArticles() {
        return {
            data: this.knowledgeService.listArticles(),
        };
    }

    @Get('search')
    searchArticles(@Query('q') query = '') {
        return {
            data: this.knowledgeService.searchArticles(query),
            query,
        };
    }

    @Post()
    createArticle(@Body() dto: CreateKnowledgeArticleDto) {
        return {
            data: this.knowledgeService.createArticle(dto),
        };
    }
}
