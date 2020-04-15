import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';

export class MilestoneBuildPack {

    program: DbRecordEntityTransform;
    project: DbRecordEntityTransform;
    milestone: DbRecordEntityTransform;
    premises: object[];
    tasks: object[];
    features: object[];
    connections: object[];
    products: object[];

}
