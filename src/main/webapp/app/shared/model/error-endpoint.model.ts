export const enum EndpointType {
    SONICMQ = 'SONICMQ',
    ACTIVEMQ = 'ACTIVEMQ',
    SJMS = 'SJMS',
    SQL = 'SQL',
    HTTP4 = 'HTTP4',
    SFTP = 'SFTP',
    STREAM = 'STREAM',
    WASTEBIN = 'WASTEBIN',
    FILE = 'FILE'
}

export interface IErrorEndpoint {
    id?: number;
    type?: EndpointType;
    uri?: string;
    options?: string;
    serviceId?: number;
    headerId?: number;
}

export class ErrorEndpoint implements IErrorEndpoint {
    constructor(
        public id?: number,
        public type?: EndpointType,
        public uri?: string,
        public options?: string,
        public serviceId?: number,
        public headerId?: number
    ) {}
}
