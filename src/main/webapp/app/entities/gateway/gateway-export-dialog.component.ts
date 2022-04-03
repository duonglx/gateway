import { Component, OnInit, OnDestroy, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GatewayService } from './gateway.service';
import { IGateway } from 'app/shared/model/gateway.model';
import { GatewayPopupService } from 'app/entities/gateway/gateway-popup.service';
import { DeploymentService } from 'app/admin/deployment/deployment.service';

@Component({
    selector: 'jhi-gateway-export-dialog',
    templateUrl: './gateway-export-dialog.component.html'
})
export class GatewayExportDialogComponent implements AfterContentInit {
    gatewayId: number;
    gateways: Array<IGateway> = [];
    xmlConfiguration: any;
    fileName = 'Choose file';
    exportError = false;

    constructor(
        private gatewayService: GatewayService,
        public activeModal: NgbActiveModal,
        protected deploymentService: DeploymentService
    ) {}

    ngAfterContentInit() {
        this.gatewayService.query().subscribe(res => {
            this.gateways = res.body;
            this.gatewayId = this.gateways[0].id;
        });
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    exportConfiguration(gateways: IGateway[], gatewayId: number) {
        this.deploymentService.exportGatewayConfiguration(gateways.find(i => i.id === gatewayId));
        this.activeModal.dismiss(true);
    }
}
