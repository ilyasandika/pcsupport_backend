import { SetMetadata } from '@nestjs/common';

export const SKIP_SERIALIZATION = 'skip_serialization';

export const UseTypia = () => SetMetadata(SKIP_SERIALIZATION, true);
