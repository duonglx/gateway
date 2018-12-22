import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';

import { IHeader } from 'app/shared/model/header.model';
import { AccountService } from 'app/core';
import { HeaderService } from './header.service';
import { HeaderKeysComponent, HeaderKeysService, HeaderKeys } from '../../entities/header-keys';
import { Principal, ResponseWrapper } from '../../shared';

@Component({
    selector: 'jhi-header',
    templateUrl: './header.component.html',
        entryComponents: [
            HeaderKeysComponent
            ],
})

export class HeaderComponent implements OnInit, OnDestroy {
    public headers: Array<Header> = [];
    currentAccount: any;
    eventSubscriber: Subscription;
    headerKeys: Array<HeaderKeys>
    headerKey: HeaderKeys;
    selectedHeaderId: number;

    constructor(
        private headerService: HeaderService,
        private headerKeysService: HeaderKeysService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private principal: Principal
    ) {
    }

    loadAll() {
        this.headerService.query().subscribe(
            (res: ResponseWrapper) => {
                this.headers = res.json;
                if (this.headers.length > 0) {
                    this.selectedHeaderId = this.headers[this.headers.length - 1].id;
                    this.filterHeaderKeys(this.selectedHeaderId);
                }
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.accountService.identity().then(account => {
            this.currentAccount = account;
        });
        if (this.headerKey !== undefined ) {
            this.eventManager.subscribe('headerKeyDeleted', (res) => this.updateHeaderKeys(res.content))
        }else {
            this.eventManager.subscribe('headerKeyDeleted', (res) => res.content)
        }
        this.registerChangeInHeaders();
        this.selectOption();
    }

    updateHeaderKeys(id: number) {
        this.headerKeys = this.headerKeys.filter((x) => x.id === id);
        const newHeaderKeys = new HeaderKeys();
        this.headerKeys.push(newHeaderKeys);
    }
    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    filterHeaderKeys(id) {
        this.headerKeysService.query().subscribe(
            (res: ResponseWrapper) => {
                this.headerKeys = res.json;
                this.headerKeys = this.headerKeys.filter((k) => k.headerId === id);
                if (this.headerKeys.length === 0) {
                    const newHeaderKeys = new HeaderKeys();
                    newHeaderKeys.isDisabled = false;
                    this.headerKeys.push(newHeaderKeys);
                }
            },
            (res: ResponseWrapper) => this.onError(res.json)
        );
    }

    trackId(index: number, item: Header) {
        return item.id;
    }

    registerChangeInHeaders() {
        this.eventSubscriber = this.eventManager.subscribe('headerListModification', response => this.loadAll());
    }

    selectOption() {
      this.filterHeaderKeys(this.selectedHeaderId);
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
