import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';

export class TaskDto {
    public title: string;
    public properties: {
        Type: string,
        Category: string,
        Description: string,
        Order: number
        ExternalRef?: string,
        PIANOI?: string
    };
    public blockedByPrevious: boolean;
    public subtaskTemplateKey?: string;
    public associations: DbRecordAssociationCreateUpdateDto[];
}
