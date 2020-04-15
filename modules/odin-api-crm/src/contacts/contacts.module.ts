import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ContactsIdentitiesService } from "./identities/contacts.identities.service";

@Module({
    imports: [],
    controllers: [],
    providers: [ ContactsService, ContactsIdentitiesService ],
    exports: [ ContactsService, ContactsIdentitiesService ],
})
export class ContactsModule {
}
