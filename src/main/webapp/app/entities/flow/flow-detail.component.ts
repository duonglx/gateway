import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager } from 'ng-jhipster';

import { Flow } from './flow.model';
import { FlowService } from './flow.service';
import { FromEndpoint, FromEndpointService } from '../from-endpoint';
import { ToEndpoint, ToEndpointService } from '../to-endpoint';
import { ErrorEndpoint, ErrorEndpointService } from '../error-endpoint';
import { BaseEntity } from '../../shared';
import { GatewayService, Gateway } from '../gateway';
import { NgbTabsetConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'jhi-flow-detail',
    templateUrl: './flow-detail.component.html',
    providers: [NgbTabsetConfig]
})
export class FlowDetailComponent implements OnInit, OnDestroy {

    flow: Flow;
    gateway: Gateway;
    fromEndpoint: FromEndpoint;
    toEndpoint: ToEndpoint;
    errorEndpoint: ErrorEndpoint;
    private subscription: Subscription;
    private eventSubscriber: Subscription;

    constructor(
        public tabsetConfig: NgbTabsetConfig,
        private gatewayService: GatewayService,
        private fromEndpointService: FromEndpointService,
        private toEndpointService: ToEndpointService,
        private errorEndpointService: ErrorEndpointService,
        private eventManager: JhiEventManager,
        private flowService: FlowService,
        private route: ActivatedRoute
    ) {
        tabsetConfig.justify = 'fill';
    }

    ngOnInit() {
        this.subscription = this.route.params.subscribe((params) => {
            this.load(params['id']);
        });
        this.registerChangeInFlows();
    }

    load(id) {
        this.flowService.find(id).subscribe((flow) => {
            this.flow = flow;
            this.getGateway(flow.gatewayId);
            this.getFromEndpoint(flow.fromEndpointId);
            this.getToEndpointByFlowId(flow.id);
            this.getErrorEndpoint(flow.errorEndpointId);
        });
    }

    getGateway(id) {
        if (!id) { return; }

        this.gatewayService.find(id)
            .subscribe((gateway) => this.gateway = gateway);
    }

    getFromEndpoint(id) {
        if (!id) { return; }

        this.fromEndpointService.find(id)
            .subscribe((fromEndpoint) => this.fromEndpoint = fromEndpoint);
    }

    getToEndpointByFlowId(id) {
        if (!id) { return; }

        this.toEndpointService.findByFlowId(id)
            .subscribe((toEndpoints) => this.toEndpoint = toEndpoints[0]);
    }

    getErrorEndpoint(id) {
        if (!id) { return; }

        this.errorEndpointService.find(id)
            .subscribe((errorEndpoint) => this.errorEndpoint = errorEndpoint);
    }

    previousState() {
        window.history.back();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.eventManager.destroy(this.eventSubscriber);
    }

    registerChangeInFlows() {
        this.eventSubscriber = this.eventManager.subscribe(
            'flowListModification',
            (response) => this.load(this.flow.id)
        );
    }
}
