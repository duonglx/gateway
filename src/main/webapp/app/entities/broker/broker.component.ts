import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { Router } from '@angular/router';

import { IBroker } from 'app/shared/model/broker.model';
import { AccountService } from 'app/core';
import { BrokerService } from './broker.service';

enum Status {
    active = 'active',
    paused = 'paused',
    inactive = 'inactive',
    inactiveError = 'inactiveError'
}
@Component({
    selector: 'jhi-broker',
    templateUrl: './broker.component.html'
})
export class BrokerComponent implements OnInit, OnDestroy {
    brokers: IBroker[];
    broker: IBroker;

    currentAccount: any;
    eventSubscriber: Subscription;

    public isBrokerStarted: boolean;
    public isBrokerRestarted: boolean;
    public isBrokerStopped: boolean;
    public isBrokerPaused: boolean;
    public isBrokerResumed: boolean;

    public disableActionBtns: boolean;

    public brokerDetails: string;
    public brokerInfo: string;
    public brokerStatus: string;
    public brokerStatusError: string;
    public isBrokerStatusOK: boolean;
    public brokerStatusButton: string;

    lastError: string;

    constructor(
        protected brokerService: BrokerService,
        protected jhiAlertService: JhiAlertService,
        protected eventManager: JhiEventManager,
        protected accountService: AccountService,
        protected router: Router
    ) {
        this.router.routeReuseStrategy.shouldReuseRoute = function() {
            return false;
        };
    }

    loadAll() {
        this.brokerService.query().subscribe(
            (res: HttpResponse<IBroker[]>) => {
                this.brokers = res.body;
                this.broker = this.brokers[0];
                if (this.broker) {
                    this.getbrokerStatus(this.broker.id);
                } else {
                    this.setbrokerStatus('unconfigured');
                }
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.setBrokerStatusDefaults();

        this.loadAll();

        this.accountService.identity().then(account => {
            this.currentAccount = account;
        });
        this.registerChangeInBrokers();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    getbrokerStatus(id: number) {
        this.brokerService.getBrokerStatus(id).subscribe(response => {
            this.setbrokerStatus(response.body);
        });
    }

    setbrokerStatus(status: string): void {
        switch (status) {
            case 'unconfigured':
                this.brokerStatus = Status.inactive;
                this.isBrokerStarted = this.isBrokerPaused = false;
                this.isBrokerStopped = this.isBrokerRestarted = this.isBrokerResumed = true;
                this.brokerStatusButton = `
                            Last action: - <br/>
                            Status: Stopped<br/>
            `;

                break;
            case 'started':
                this.brokerStatus = Status.active;
                this.isBrokerPaused = this.isBrokerStopped = this.isBrokerRestarted = false;
                this.isBrokerStarted = this.isBrokerResumed = true;
                this.brokerStatusButton = `
                            Last action: Start <br/>
                            Status: Started succesfullly
                        `;

                break;
            case 'restarted':
                this.brokerStatus = Status.active;
                this.isBrokerPaused = this.isBrokerStopped = this.isBrokerRestarted = false;
                this.isBrokerResumed = this.isBrokerStarted = true;
                this.brokerStatusButton = `
                            Last action: Restart <br/>
                            Status:  Restarted succesfully
            `;
                break;
            case 'stopped':
                this.brokerStatus = Status.inactive;
                this.isBrokerStarted = this.isBrokerPaused = false;
                this.isBrokerStopped = this.isBrokerRestarted = this.isBrokerResumed = true;
                this.brokerStatusButton = `
                            Last action: Stop <br/>
                            Status: Stopped succesfully
            `;
                break;
            default:
                this.brokerStatusButton = `
                            Last action: ${this.brokerStatus} <br/>
                            Status: Stopped after error
              `;
                break;
        }
    }

    setBrokerStatusDefaults() {
        this.isBrokerStatusOK = true;
        this.brokerStatus = 'unconfigured';
        this.lastError = '';
        this.setbrokerStatus('unconfigured');
    }

    getBrokerInfo(id: number) {
        this.brokerService.getBrokerInfo(id).subscribe(res => {
            this.setBrokerInfo(res.body);
        });
    }

    setBrokerInfo(info: String) {
        if (info.startsWith('no info')) {
            this.brokerInfo = `Currently there are no statistics for this flow.`;
        } else {
            var infoSplitted = info.split(',');

            const uptime = infoSplitted[0].split('=').pop();
            const totalConnections = infoSplitted[1].split('=').pop();
            const totalConsumers = infoSplitted[2].split('=').pop();
            const totalMessages = infoSplitted[3].split('=').pop();
            const nodeId = infoSplitted[4].split('=').pop();
            const state = infoSplitted[5].split('=').pop();
            const version = infoSplitted[6].split('=')[1];

            this.brokerInfo = `
               <br/>
               <b>Broker Node ID:</b> ${nodeId}<br/>
               <b>Broker version:</b> ${version}<br/>
               <b>Broker state:</b> ${state}<br/>
               <b>Broker uptime:</b> ${uptime}<br/>
               <br/>
               <b>Total Connections:</b> ${totalConnections}<br/>
               <b>Total Consumers:</b> ${totalConsumers}<br/>
               <b>Total Messages:</b> ${totalMessages}<br/>`;
        }
    }

    start() {
        this.brokerStatus = 'Starting';
        this.isBrokerStatusOK = true;
        this.disableActionBtns = true;

        this.brokerService.start(this.broker.id).subscribe(
            response => {
                if (response.status === 200) {
                    this.setbrokerStatus('started');
                }
                this.disableActionBtns = false;
            },
            err => {
                //this.getFlowLastError(this.broker.id, 'Start', err.error);
                this.isBrokerStatusOK = false;
                this.brokerStatusError = `Flow with id=${this.broker.id} is not started.`;
                this.disableActionBtns = false;
            }
        );
    }

    restart() {
        this.brokerStatus = 'Restarting';
        this.isBrokerStatusOK = true;
        this.disableActionBtns = true;

        this.brokerService.restart(this.broker.id).subscribe(
            response => {
                if (response.status === 200) {
                    this.setbrokerStatus('restarted');
                }
                this.disableActionBtns = false;
            },
            err => {
                //this.getFlowLastError(this.broker.id, 'Restart', err.error);
                this.isBrokerStatusOK = false;
                this.brokerStatusError = `Flow with id=${this.broker.id} is not restarted.`;
                this.disableActionBtns = false;
            }
        );
    }

    stop() {
        this.brokerStatus = 'Stopping';
        this.isBrokerStatusOK = true;
        this.disableActionBtns = true;

        this.brokerService.stop(this.broker.id).subscribe(
            response => {
                if (response.status === 200) {
                    this.setbrokerStatus('stopped');
                }
                this.disableActionBtns = false;
            },
            err => {
                //this.getFlowLastError(this.broker.id, 'Stop', err.error);
                this.isBrokerStatusOK = false;
                this.brokerStatusError = `Flow with id=${this.broker.id} is not stopped.`;
                this.disableActionBtns = false;
            }
        );
    }

    getBrokerDetails() {
        this.brokerDetails = `
        
                <b>ID:</b> ${this.broker.id}<br/>
                <b>Name:</b> ${this.broker.name}<br/>
                <b>Type:</b> ${this.broker.type}<br/>
                <b>Configuration Type:</b> ${this.broker.configurationType}<br/>
        `;
    }

    trackId(index: number, item: IBroker) {
        return item.id;
    }

    registerChangeInBrokers() {
        this.eventSubscriber = this.eventManager.subscribe('brokerListModification', response => this.loadAll());
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
