export interface ENVIRONMENT {
    name: string,
    matchStr: string
};

export const ENVIRONMENTS: Array<ENVIRONMENT> = [
    {
        name: 'docker',
        matchStr: 'docker',
    },
    {
        name: 'k8',
        matchStr: 'kube',
    },
    {
        name: 'local',
        matchStr: 'localhost',
    },
];

export enum ENVIRONMENT_TYPES {
    DOCKER = 'docker',
    K8 = 'k8',
    LOCAL = 'local'
}

export const ENVIRONMENT_DEFAULT: ENVIRONMENT = ENVIRONMENTS[0];
