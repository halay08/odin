import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { IDbRecordCreateUpdateRes } from '@d19n/models/dist/schema-manager/db/record/interfaces/interfaces';
import { getProperty, getPropertyFromRelation } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { ElasticSearchClient } from '@d19n/schema-manager/dist/common/ElasticSearchClient';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { Client } from '@elastic/elasticsearch';
import { forwardRef, Inject } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { Address } from 'uk-clear-addressing';
import { VisitsService } from '../visit/visits.service';
import { royalMailPafFull } from './sql-selects';
import moment = require('moment');


export class OpsPremiseCreateUpdate {
    public udprn: string;
    public umprn: string;
    public statusId: number;
}

class OpsPremiseDto {
    public uprn;
    public umprn;
    public udprn;
    public build_status_id;
    public sales_status_id;
    public season_id;
    public year;
    public latitude;
    public longitude;
    public x_coordinate;
    public y_coordinate;
    public geom;
}

export class PremisesService {

    private visitsService: VisitsService;
    private schemasService: SchemasService;
    private dbService: DbService;
    private elasticSearchClient: ElasticSearchClient;
    private readonly odinDb: Connection;

    constructor(
        @InjectConnection('odinDbConnection') odinDb: Connection,
        @Inject('ELASTIC_SEARCH_CLIENT') public readonly esClient: Client,
        @Inject(forwardRef(() => DbService)) dbService: DbService,
        visitsService: VisitsService,
        schemasService: SchemasService,
    ) {
        this.odinDb = odinDb;
        this.esClient = esClient;
        this.elasticSearchClient = new ElasticSearchClient(esClient);
        this.dbService = dbService;
        this.visitsService = visitsService;
        this.schemasService = schemasService;
    }

    /**
     * Adding a new sales status to a premise
     * @param principal
     * @param body
     */
    async bulkUpdateCreateOpsPremiseStatusByPrincipal(
        principal: OrganizationUserEntity,
        body: OpsPremiseCreateUpdate[],
    ) {
        const opsDataSet: OpsPremiseDto[] = [];
        const esDataSet: Record<any, any>[] = [];
        try {

            const premiseSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                principal.organization,
                `${SchemaModuleTypeEnums.CRM_MODULE}:Premise`,
            );

            for(const data of body) {

                const recordId = `${data.udprn}-${data.umprn}`;
                const opsPremise = {
                    uprn: 0,
                    umprn: data.umprn ? data.umprn : 0,
                    udprn: data.udprn ? Number(data.udprn) : 0,
                    build_status_id: 0,
                    sales_status_id: data.statusId,
                    season_id: 0,
                    year: moment().year(),
                    latitude: null,
                    longitude: null,
                    x_coordinate: null,
                    y_coordinate: null,
                    geom: null,
                };
                opsDataSet.push(opsPremise);

                // esDataSet.push({ 'update': { '_index': premiseSchema.id } });
                // esDataSet.push(esBody);
            }

            const res = await this.odinDb.manager.createQueryBuilder()
                .insert()
                .into('ops.premises', [
                    'uprn',
                    'umprn',
                    'udprn',
                    'build_status_id',
                    'sales_status_id',
                    'season_id',
                    'year',
                    'latitude',
                    'longitude',
                    'x_coordinate',
                    'y_coordinate',
                    'geom',
                ])
                .values(opsDataSet)
                .onConflict(`("udprn", "umprn") DO UPDATE SET "sales_status_id" = excluded.sales_status_id`)
                .execute();

            await this.elasticSearchClient.bulk(esDataSet);

            return res;
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

    /**
     *
     * @param organization
     * @param udprn
     * @param umprn
     */
    async getPremiseByUdprnAndUmprnAndOrganization(
        organization: OrganizationEntity,
        udprn: string,
        umprn: string,
    ) {
        try {
            let premise;

            if(![ '0' ].includes(umprn)) {
                premise = await this.odinDb.query(`SELECT t1.udprn, t3.build_status_id, t3.season_id, t3.year, t3.sales_status_id, t4.status, t3.ab_plus_class_1, t3.build_status_name, t3.target_release_date, t3.ex_polygon_id, t3.l2_polygon_id, t3.l4_polygon_id, t3.ab_plus_class_1 \
                    FROM royal_mail.paf as t1 \
                    LEFT JOIN royal_mail.pafmr as t2 ON (t1.udprn = t2.udprn) \
                    LEFT JOIN ops.premises as t3 ON (t1.udprn = t3.udprn) \
                    LEFT JOIN ops.premises_sales_statuses as t4 ON (t4.id = t3.sales_status_id) \
                    WHERE t1.udprn = ${udprn} AND t2.umprn = ${umprn}`);
            } else {
                premise = await this.odinDb.query(`SELECT t1.udprn, t2.build_status_id, t2.season_id, t2.year, t2.sales_status_id, t3.status, t2.ab_plus_class_1, t2.build_status_name, t2.target_release_date, t2.ex_polygon_id, t2.l2_polygon_id, t2.l4_polygon_id, t2.ab_plus_class_1 \
                    FROM royal_mail.paf as t1 \
                    LEFT JOIN ops.premises as t2 ON (t1.udprn = t2.udprn) \
                    LEFT JOIN ops.premises_sales_statuses as t3 ON (t3.id = t2.sales_status_id) \
                    WHERE t1.udprn = ${udprn}`);
            }

            // Search pafmisc / pafmrmisc
            if(premise && premise.length < 1) {
                if(![ '0' ].includes(umprn)) {
                    premise = await this.odinDb.query(`SELECT t1.udprn, t3.build_status_id, t3.season_id, t3.year, t3.sales_status_id, t4.status, t3.ab_plus_class_1, t3.build_status_name, t3.target_release_date, t3.ex_polygon_id, t3.l2_polygon_id, t3.l4_polygon_id, t3.ab_plus_class_1 \
                    FROM royal_mail.pafmisc as t1 \
                    LEFT JOIN royal_mail.pafmrmisc as t2 on (t1.udprn = t2.udprn) \
                    LEFT JOIN ops.premises as t3 ON (t1.udprn = t3.udprn) \
                    LEFT JOIN ops.premises_sales_statuses as t4 ON (t4.id = t3.sales_status_id) \
                    WHERE t1.udprn = ${udprn} AND t2.umprn = ${umprn}`);
                } else {
                    premise = await this.odinDb.query(`SELECT t1.udprn, t2.build_status_id, t2.season_id, t2.year, t2.sales_status_id, t3.status, t2.ab_plus_class_1, t2.build_status_name, t2.target_release_date, t2.ex_polygon_id, t2.l2_polygon_id, t2.l4_polygon_id, t2.ab_plus_class_1 \
                    FROM royal_mail.pafmisc as t1 \
                    LEFT JOIN ops.premises as t2 ON (t1.udprn = t2.udprn) \
                    LEFT JOIN ops.premises_sales_statuses as t3 ON (t3.id = t2.sales_status_id) \
                    WHERE t1.udprn = ${udprn}`);
                }
            }
            if(!premise[0]) {
                throw new ExceptionType(404, `no premise found with udprn: ${udprn} and umprn: ${umprn}`);
            }

            const pafData = await this.getPremiseFromPafAndFormat(udprn, umprn);
            return { ...pafData, ...premise[0] };

        } catch (e) {
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

    /**
     *
     * @param udprn
     * @param umprn
     */
    private async getPremiseFromPafAndFormat(udprn: string, umprn: string) {
        try {
            let data;
            // try to locate in paf
            if(![ '0' ].includes(umprn)) {
                data = await this.odinDb.query(`SELECT ${royalMailPafFull('t1').join()} \
                 FROM royal_mail.paf as t1 \
                 LEFT JOIN royal_mail.pafmr as t2 ON (t1.udprn = t2.udprn) \
                 WHERE t1.udprn = ${udprn} AND t2.umprn = ${umprn}`);
            } else {
                data = await this.odinDb.query(`SELECT ${royalMailPafFull('t1').join()}  \
                FROM royal_mail.paf as t1 WHERE t1.udprn = ${udprn}`);
            }
            if(data && data.length < 1) {
                // get from misc if does not exist in paf
                if(![ '0' ].includes(umprn)) {
                    data = await this.odinDb.query(`SELECT ${royalMailPafFull('t1').join()} \
                FROM royal_mail.pafmisc as t1 \
                LEFT JOIN royal_mail.pafmrmisc as t2 on (t1.udprn = t2.udprn) \
                WHERE t1.udprn = ${udprn} AND t2.umprn = ${umprn}`);
                } else {
                    data = await this.odinDb.query(`SELECT ${royalMailPafFull('t1').join()} \
                FROM royal_mail.pafmisc as t1 \
                WHERE t1.udprn = ${udprn}`);
                }
            }

            data = data[0];
            if(!!data) {
                const pafRecord = {
                    postcode: data.postcode,
                    post_town: data.posttown,
                    thoroughfare: data.thoroughfare_and_descriptor,
                    building_name: data.building_name,
                    organisation_name: data.organisation_name,
                    ...data,
                };

                let {
                    line_1,
                    line_2,
                    line_3,
                    premise,
                    post_town,
                    postcode,
                } = new Address(pafRecord);

                let fullAddress = '';
                let buildingNumber = 0;
                let deliveryPointSuffixNumber = 0;
                let deliveryPointSuffixLetter = 'A';

                if(!!line_1) {
                    fullAddress = fullAddress.concat(line_1 + ', ');
                }
                if(!!line_2) {
                    fullAddress = fullAddress.concat(line_2 + ', ');
                }
                if(!!line_3) {
                    fullAddress = fullAddress.concat(line_3 + ', ');
                }
                if(!!post_town) {
                    fullAddress = fullAddress.concat(post_town + ', ');
                }
                if(!!post_town) {
                    fullAddress = fullAddress.concat(postcode);
                }

                // Extract building number and delivery point suffix for sorting
                if(!!pafRecord.building_number) {
                    buildingNumber = Number(pafRecord.building_number);
                }

                if(!!pafRecord.delivery_point_suffix) {
                    const numberNoStrings = (pafRecord.delivery_point_suffix).replace(/(^\d+)(.+$)/i, '$1');
                    deliveryPointSuffixNumber = Number(numberNoStrings);
                    deliveryPointSuffixLetter = (pafRecord.delivery_point_suffix).replace(numberNoStrings, '');
                }

                if(!pafRecord.delivery_point_suffix && !pafRecord.building_number) {
                    const numberNoStrings = (pafRecord.fullAddress).replace(/(^.+)(\w\d+\w)(.+$)/i, '$2');
                    // for multiple residences use delivery point suffix
                    // for single residences use building number
                    if(pafRecord.number_of_households > 1) {
                        deliveryPointSuffixNumber = Number(numberNoStrings);
                    } else {
                        buildingNumber = Number(numberNoStrings);
                    }
                }
                const body = {
                    title: fullAddress,
                    properties: {
                        id: `${data.udprn}-0`,
                        UDPRN: data.udprn,
                        UMPRN: 0,
                        FullAddress: fullAddress,
                        AddressLine1: line_1,
                        AddressLine2: line_2,
                        AddressLine3: line_3,
                        Premise: premise,
                        PostTown: post_town,
                        PostalCode: postcode,
                        PostalCodeNoSpace: postcode.replace(' ', ''),
                        BuildingNumber: buildingNumber,
                        DeliveryPointSuffixNumber: deliveryPointSuffixNumber,
                        DeliveryPointSuffixLetter: deliveryPointSuffixLetter,
                    },
                };

                return body;
            }
            return;
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

    /**
     *
     * @param principal
     * @param udprn
     * @param umprn
     * @param body
     */
    async createNewVisit(
        principal: OrganizationUserEntity,
        udprn: string,
        umprn: string,
        body: DbRecordCreateUpdateDto,
    ): Promise<IDbRecordCreateUpdateRes> {
        try {

            const premiseSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                principal.organization,
                `${SchemaModuleTypeEnums.CRM_MODULE}:Premise`,
            );

            const recordId = `${udprn}-${umprn}`;
            const visitRes = await this.visitsService.createNewVisit(principal, body);
            const visit = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                visitRes[0].id,
                [],
            );


            // Parse date for visit follow up date
            await this.elasticSearchClient.client.updateByQuery({
                index: premiseSchema.id,
                refresh: true,
                body: {
                    'script': {
                        'lang': 'painless',
                        'source': `ctx._source.properties.VisitOutcome = '${getProperty(visit, 'Outcome')}'; \
                            ctx._source.properties.VisitFollowUpDate = '${getProperty(visit, 'FollowUpDate')}'; \
                            ctx._source.properties.LastVisitBy = '${principal.id}';`,
                    },
                    'query': {
                        'match': {
                            'properties.id.keyword': {
                                'query': recordId,
                            },
                        },
                    },
                },
            }, {
                ignore: [ 404 ],
                maxRetries: 3,
            });

            return visitRes[0];
        } catch (e) {
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

    /**
     *
     * @param principal
     * @param leadId
     */
    async addRelatedLeadToPremise(principal: OrganizationUserEntity, leadId: string | null) {
        try {
            const { ADDRESS } = SchemaModuleEntityTypeEnums;

            const lead = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                leadId,
                [ ADDRESS ],
            );
            const premiseSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                principal.organization,
                `${SchemaModuleTypeEnums.CRM_MODULE}:Premise`,
            );

            if(lead[ADDRESS].dbRecords) {
                const udprn = getPropertyFromRelation(lead, ADDRESS, 'UDPRN');
                const umprn = getPropertyFromRelation(lead, ADDRESS, 'UMPRN');

                const recordId = `${udprn}-${umprn}`;

                await this.elasticSearchClient.client.updateByQuery({
                    index: premiseSchema.id,
                    refresh: true,
                    body: {
                        'script': {
                            'lang': 'painless',
                            'source': `ctx._source.properties.LeadId = '${leadId}';`,
                        },
                        'query': {
                            'match': {
                                'properties.id.keyword': {
                                    'query': recordId,
                                },
                            },
                        },
                    },
                }, {
                    ignore: [ 404 ],
                    maxRetries: 3,
                });

                return { affected: 1, recordId, leadId };
            } else {
                return { affected: 0, message: 'the lead does not have an address matching a premise' };
            }
        } catch (e) {
            console.error(e);
            if(e && e.meta && e.meta.body) {
                console.error('elastic search sync: error', e.meta.body.failures);
                throw new ExceptionType(500, e.meta.body.error);
            }
            throw new ExceptionType(500, e.message);
        }
    }

    /**
     *
     * @param principal
     * @param leadId
     */
    async removeRelatedLeadFromPremise(principal: OrganizationUserEntity, leadId: string | null) {
        return new Promise(async (resolve, reject) => {
            try {
                const premiseSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                    principal.organization,
                    `${SchemaModuleTypeEnums.CRM_MODULE}:Premise`,
                );
                await this.elasticSearchClient.client.updateByQuery({
                    index: premiseSchema.id,
                    refresh: true,
                    body: {
                        'script': {
                            'lang': 'painless',
                            'source': `ctx._source.properties.LeadId = null;`,
                        },
                        'query': {
                            'match': {
                                'properties.LeadId.keyword': {
                                    'query': leadId,
                                },
                            },
                        },
                    },
                }, {
                    ignore: [ 404 ],
                    maxRetries: 3,
                });

                return resolve({ affected: 1, leadId });
            } catch (e) {
                console.error(e);
                return reject(new ExceptionType(500, e.message));
            }
        });
    }
}
