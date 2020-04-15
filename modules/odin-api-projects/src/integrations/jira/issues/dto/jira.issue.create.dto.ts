export class JiraIssueCreateDto {
    fields: {
        project: {
            // TEST
            key: string,
        },
        // 'REST ye merry gentlemen.'
        summary: string,
        // 'Creating of an issue using project keys and issue type names using the REST API'
        description: string,
        issuetype: {
            //'Task'
            name: string
        },
        // [ "bugfix", "blitz_test" ]
        labels?: string[],
        assignee?: {
            id: string
        }
    }
}
