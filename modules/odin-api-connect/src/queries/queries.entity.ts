import { Base } from '@d19n/models/dist/Base';
import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';
import { Column, Entity, Index, ManyToOne } from 'typeorm';

@Entity({ name: 'queries' })
@Index([ 'organization', 'name', 'type' ], { unique: true })
export class QueryEntity extends Base {

    @ManyToOne(type => OrganizationEntity)
    public organization?: string;

    @ManyToOne(type => OrganizationUserEntity)
    public user?: string;

    // human readable name / description of the query
    @ApiProperty()
    @Length(3, 55)
    @Column({ type: 'varchar', length: 55, nullable: false })
    public name: string;

    // human readable name / description of the query
    @ApiProperty()
    @Length(3, 255)
    @Column({ type: 'varchar', length: 255, nullable: false })
    public description: string;

    @ApiProperty()
    @Column({ type: 'varchar', length: 255, nullable: false })
    public type: 'ELASTIC_SEARCH' | 'SQL';

    @ApiProperty()
    @Column({ type: 'jsonb', nullable: true })
    public params: any;

    @ApiProperty()
    @Column({ type: 'text', nullable: false })
    public query: string;

}
