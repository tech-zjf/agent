import { Body, Controller, Post } from '@nestjs/common';
import { DraftReplyDto } from './dto/draft-reply.dto';
import { CopilotService } from './copilot.service';

@Controller('api/copilot')
export class CopilotController {
    constructor(private readonly copilotService: CopilotService) {}

    @Post('draft-reply')
    draftReply(@Body() dto: DraftReplyDto) {
        return {
            data: this.copilotService.draftReply(dto),
        };
    }
}
