import { Module } from '@nestjs/common';
import { VendorsService } from './vendors.service';

@Module({
    imports: [],
    providers: [ VendorsService ],
    exports: [ VendorsService ],
})
export class VendorsModule {

}
