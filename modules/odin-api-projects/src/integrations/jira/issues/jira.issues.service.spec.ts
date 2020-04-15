import { APIClient } from '@d19n/client/dist/common/APIClient';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { AuthUserHelper } from '@d19n/schema-manager/dist/helpers/AuthUserHelper';
import { TestModuleConfig } from '@d19n/schema-manager/dist/helpers/tests/TestModuleConfig';
import { TestingModule } from '@nestjs/testing';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { JiraIssueCreateDto } from './dto/jira.issue.create.dto';
import { JiraIssuesService } from './jira.issues.service';

dotenv.config();
jest.setTimeout(100000);

describe('Jira issues service', () => {

    let principal: OrganizationUserEntity;

    let service: JiraIssuesService;
    let uuid;

    let app: TestingModule;

    beforeEach(async () => {

        uuid = uuidv4();

        app = await new TestModuleConfig([], [
            JiraIssuesService,
        ], []).initialize();

        const login = await AuthUserHelper.login();
        principal = await APIClient.call<OrganizationUserEntity>({
            facility: 'http',
            baseUrl: Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
            service: 'v1.0/users/my',
            method: 'get',
            headers: { Authorization: login.headers.authorization },
            debug: false,
        });

        service = app.get<JiraIssuesService>(JiraIssuesService);
    });

    describe('should manage jira issues', () => {

        it('should create a new jira issue in a project', async (done) => {

            const createDto = new JiraIssueCreateDto();
            createDto.fields = {
                'project':
                    {
                        'key': 'TEST',
                    },
                'summary': 'REST ye merry gentlemen.',
                'description': 'Creating of an issue using project keys and issue type names using the REST API',
                'issuetype': {
                    'name': 'Task',
                },
            }

            const res = await service.createIssue(principal, createDto);
            console.log('res', res);

            done();
        });

    })

})
