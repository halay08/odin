import { Module } from '@nestjs/common';
import { PricebookService } from './pricebook.service';

@Module({
    imports: [],
    providers: [ PricebookService ],
    exports: [ PricebookService ],
})
export class PricebookModule {

}
