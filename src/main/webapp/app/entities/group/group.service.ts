import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

import { createRequestOption } from 'app/shared/util/request-util';
import { IGroup } from 'app/shared/model/group.model';

type EntityResponseType = HttpResponse<IGroup>;
type EntityArrayResponseType = HttpResponse<IGroup[]>;

@Injectable({ providedIn: 'root' })
export class GroupService {
    public resourceUrl = this.applicationConfigService.getEndpointFor('api/groups');

    constructor(protected http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

    create(group: IGroup): Observable<EntityResponseType> {
        return this.http.post<IGroup>(this.resourceUrl, group, { observe: 'response' });
    }

    update(group: IGroup): Observable<EntityResponseType> {
        return this.http.put<IGroup>(this.resourceUrl, group, { observe: 'response' });
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<IGroup>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IGroup[]>(this.resourceUrl, { params: options, observe: 'response' });
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }
}
