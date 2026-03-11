import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AddCustomerFactsDto } from './dto/add-customer-facts.dto';
import { MemoryService } from './memory.service';

@Controller('api/memory/customers')
export class MemoryController {
    constructor(private readonly memoryService: MemoryService) {}

    @Get(':customerId')
    async getCustomerMemory(@Param('customerId') customerId: string) {
        return this.memoryService.getCustomerMemory(customerId);
    }

    @Post(':customerId/facts')
    async addCustomerFacts(@Param('customerId') customerId: string, @Body() dto: AddCustomerFactsDto) {
        return this.memoryService.addCustomerFacts(customerId, dto.facts);
    }
}
