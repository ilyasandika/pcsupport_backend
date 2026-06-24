import { IsEnum, IsOptional } from 'class-validator';
import { TrendRange } from '../../../common/enums/common.enum';

export class GetTicketTrendDto {
  @IsOptional()
  @IsEnum(TrendRange, { message: 'Range harus berupa week, month, atau year' })
  range?: TrendRange = TrendRange.MONTH;
}
