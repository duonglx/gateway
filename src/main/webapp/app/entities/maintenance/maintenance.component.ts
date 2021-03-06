import { Component, OnInit, OnDestroy } from '@angular/core';
import { IFlow, Flow } from 'app/shared/model/flow.model';
import * as moment from 'moment';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import { WindowRef } from '../../shared/auth/window.service';
import { IMaintenance } from 'app/shared/model/maintenance.model';
import { AccountService } from 'app/core';
import { MaintenanceService } from './maintenance.service';
import { FlowService } from 'app/entities/flow';

@Component({
    selector: 'jhi-maintenance',
    templateUrl: './maintenance.component.html'
})
export class MaintenanceComponent implements OnInit, OnDestroy {
    maintenances: IMaintenance[];
    currentAccount: any;
    eventSubscriber: Subscription;
    flows: IFlow[];
    //flows: Array<IFlow> = [];
    public hours: number;
    public minutes: number;
    selectedFlows: IFlow[] = [];
    allSelected = false;
    messageFlow: string;
    intervals: Array<any> = [];
    maintenanceTimers: Array<string> = [];
    timeLeft: Array<number> = [];
    disableFlows: Array<boolean> = [];

    //sorting
    page: any;
    predicate: any;
    reverse: any;

    constructor(
        protected maintenanceService: MaintenanceService,
        protected flowService: FlowService,
        protected jhiAlertService: JhiAlertService,
        protected eventManager: JhiEventManager,
        protected accountService: AccountService
    ) {
        this.page = 0;
        this.predicate = 'name';
        this.reverse = true;
    }

    loadAll() {
        this.flowService
            .query({
                page: this.page,
                sort: this.sort()
            })
            .subscribe(
                (res: HttpResponse<IFlow[]>) => {
                    this.flows = res.body;
                },
                err => {
                    (res: HttpErrorResponse) => this.onError(res.message);
                }
            );
        this.maintenanceService.query().subscribe(
            (res: HttpResponse<IMaintenance[]>) => {
                this.maintenances = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.accountService.identity().then(account => {
            this.currentAccount = account;
        });
        this.registerChangeInMaintenances();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IMaintenance) {
        return item.id;
    }

    registerChangeInMaintenances() {
        this.eventSubscriber = this.eventManager.subscribe('maintenanceListModification', response => this.loadAll());
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }

    setMaintenance() {
        if (this.hours === undefined) {
            this.hours = 0;
        }
        if (this.minutes === undefined) {
            this.minutes = 0;
        }
        let time = this.hours * 3600 * 1000 + this.minutes * 60000;
        const ids = this.selectedFlows.filter(sf => sf !== null).map(f => f.id);
        if (ids.length > 0) {
            this.flowService.setMaintenance(time, ids).subscribe(() => {
                this.messageFlow = `Set flows into maintenance mode for:`;
                this.displayMaintenanceTimer(this.selectedFlows, time);
                this.deselectAll();
            });
        }
    }

    displayMaintenanceTimer(flows: Array<Flow>, time: number) {
        flows.forEach((flow, i) => {
            if (flow === null) {
                return;
            }
            this.timeLeft[i] = time;
            this.intervals[i] = setInterval(() => {
                this.disableFlows[i] = true;
                this.timeLeft[i] -= 1000;
                if (this.timeLeft[i] < 0) {
                    this.clearInterval(i);
                } else {
                    this.maintenanceTimers[i] = moment.utc(this.timeLeft[i]).format('HH[h] mm[min] ss[sec]');
                }
            }, 1000);
        });
    }
    clearInterval(id: number) {
        clearInterval(this.intervals[id]);
        this.disableFlows[id] = false;
        this.maintenanceTimers[id] = '';
    }

    selectAll() {
        this.flows.forEach((flow, i) => {
            this.selectedFlows[i] = flow;
        });
        this.allSelected = true;
    }

    deselectAll() {
        this.selectedFlows = [];
        this.allSelected = false;
    }

    select(e, i: number, flow: Flow) {
        e.currentTarget.checked ? (this.selectedFlows[i] = flow) : (this.selectedFlows[i] = null);
        this.allSelected = JSON.stringify(this.selectedFlows) === JSON.stringify(this.flows);
    }

    sort() {
        const result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
        if (this.predicate !== 'name') {
            result.push('name');
        }
        return result;
    }

    reset() {
        this.page = 0;
        this.flows = [];
        this.loadAll();
    }
}
