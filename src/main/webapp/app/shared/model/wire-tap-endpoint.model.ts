export const enum EndpointType {
    ACTIVEMQ = 'ACTIVEMQ',
    FILE = 'FILE',
    HTTP = 'HTTP',
    KAFKA = 'KAFKA',
    SFTP = 'SFTP',
    SJMS = 'SJMS',
    SMTP = 'SMTP',
    SONICMQ = 'SONICMQ',
    SQL = 'SQL',
    STREAM = 'STREAM',
    VM = 'VM',
    WASTEBIN = 'WASTEBIN'
}

export interface IWireTapEndpoint {
    id?: number;
    type?: EndpointType;
    uri?: string;
    options?: string;
    serviceId?: number;
    headerId?: number;
}

export class WireTapEndpoint implements IWireTapEndpoint {
    constructor(
        public id?: number,
        public type?: EndpointType,
        public uri?: string,
        public options?: string,
        public serviceId?: number,
        public headerId?: number
    ) {}
}
