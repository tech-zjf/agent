import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsString, MaxLength } from 'class-validator';

export class AddCustomerFactsDto {
    @IsArray()
    @ArrayNotEmpty()
    @ArrayMaxSize(20)
    @IsString({ each: true })
    @MaxLength(200, { each: true })
    facts!: string[];
}
