import { Component, OnInit, Input } from '@angular/core';
import { Flow } from './flow.model';
import { FlowService } from './flow.service';
import { JhiEventManager } from 'ng-jhipster';
import { FromEndpoint, FromEndpointService } from '../from-endpoint';
import { ToEndpoint, ToEndpointService } from '../to-endpoint';

@Component({
    selector: 'jhi-flow-row',
    templateUrl: './flow-row.component.html'
})

export class FlowRowComponent implements OnInit {

    @Input() flow: Flow;
    fromEndpoint: FromEndpoint;
    toEndpoint: ToEndpoint;

    fromEndpointTooltip: string;
    toEndpointTooltip: string;
    errorEndpointTooltip: string;

    constructor(
        private flowService: FlowService,
        private fromEndpointService: FromEndpointService,
        private toEndpointService: ToEndpointService,
        private eventManager: JhiEventManager
    ) {
    }

    ngOnInit() {
        this.getFromEndpoint(this.flow.fromEndpointId);
        this.getToEndpoint(this.flow.id);
    }

    getFromEndpoint(id: number) {
        this.fromEndpointService.find(id)
            .subscribe((fromEndpoint) => {
                this.fromEndpoint = fromEndpoint;
                this.fromEndpointTooltip = this.endpointTooltip(fromEndpoint.type, fromEndpoint.uri, fromEndpoint.options);
            });
    }

    getToEndpoint(id: number) {
        this.toEndpointService.find(id)
            .subscribe((toEndpoint) => {
                this.toEndpoint = toEndpoint;
                this.toEndpointTooltip = this.endpointTooltip(toEndpoint.type, toEndpoint.uri, toEndpoint.options);
            });
    }

    endpointTooltip(type, uri, options): string {
        return `${type.toLowerCase()}://${uri}?${options}`;
    }

    start(id: number) {

        this.flowService.getConfiguration(id)
            .map((response) => response.text())
            .subscribe((data) => {
                this.flowService.setConfiguration(id, data)
                    .map((response) => response.text())
                    .subscribe((data2) => {
                        console.log('data' + data2);
                        this.flowService.start(id).subscribe((response) => {
                            this.eventManager.broadcast({
                                name: 'flowListModification',
                                content: 'Start an flow'
                            });
                        });
                    });
            });
    }

    restart(id: number) {

        this.flowService.getConfiguration(id)
            .map((response) => response.text())
            .subscribe((data) => {
                this.flowService.setConfiguration(id, data)
                    .map((response) => response.text())
                    .subscribe((data2) => {
                        console.log('data' + data2);
                        this.flowService.restart(id).subscribe((response) => {
                            this.eventManager.broadcast({
                                name: 'flowListModification',
                                content: 'Restart an flow'
                            });
                        });
                    });
            });
    }

    stop(id: number) {
        this.flowService.stop(id).subscribe((response) => {
            this.eventManager.broadcast({
                name: 'flowListModification',
                content: 'Stop an flow'
            });
        });
    }
}
