import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager } from 'ng-jhipster';

import { ToEndpoint } from './to-endpoint.model';
import { ToEndpointService } from './to-endpoint.service';
import { HeaderService } from '../header/header.service';
import { ServiceService } from '../service/service.service';

@Component({
    selector: 'jhi-to-endpoint-detail',
    templateUrl: './to-endpoint-detail.component.html'
})
export class ToEndpointDetailComponent implements OnInit, OnDestroy {

    toEndpoint: ToEndpoint;
    private subscription: Subscription;
    private eventSubscriber: Subscription;
    public headerName: string;
    public serviceName: string;

    constructor(
        private eventManager: JhiEventManager,
        private toEndpointService: ToEndpointService,
        private headerService: HeaderService,
        private serviceService: ServiceService,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit() {
        this.subscription = this.route.params.subscribe((params) => {
            this.load(params['id']);
        });
        this.registerChangeInToEndpoints();
    }

    load(id) {
        this.toEndpointService.find(id).subscribe((toEndpoint) => {
            this.toEndpoint = toEndpoint;

            this.headerService.find(this.toEndpoint.headerId)
                .subscribe((header) => {
                    this.headerName = header.name;
                });

            this.serviceService.find(this.toEndpoint.serviceId)
                .subscribe((service) => {
                    this.serviceName = service.name;
                });
        });
    }
    previousState() {
        window.history.back();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.eventManager.destroy(this.eventSubscriber);
    }

    registerChangeInToEndpoints() {
        this.eventSubscriber = this.eventManager.subscribe(
            'toEndpointListModification',
            (response) => this.load(this.toEndpoint.id)
        );
    }
}
