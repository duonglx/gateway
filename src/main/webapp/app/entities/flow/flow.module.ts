import { NgModule, CUSTOM_ELEMENTS_SCHEMA, ErrorHandler } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { PopoverModule } from 'ngx-bootstrap';
import { GatewaySharedModule } from '../../shared';
import { GatewayFromEndpointModule } from '../../entities/from-endpoint/from-endpoint.module';
import { GatewayToEndpointModule } from '../../entities/to-endpoint/to-endpoint.module';
import { GatewayErrorEndpointModule } from '../../entities/error-endpoint/error-endpoint.module';
import { GatewayServiceModule } from '../../entities/service/service.module';
import { GatewayHeaderModule } from '../../entities/header/header.module';
import { GatewayMaintenanceModule } from '../../entities/maintenance/maintenance.module';
import { GatewaySecurityModule } from '../../entities/security/security.module';

import { FlowSearchByNamePipe } from './flow.searchbyname.pipe';

import {
    FlowComponent,
    FlowEditAllComponent,
    FlowConfigurationComponent,
    FlowDetailComponent,
    FlowUpdateComponent,
    FlowDeletePopupComponent,
    FlowDeleteDialogComponent,
    flowRoute,
    flowPopupRoute,
    FlowPopupService,
    FlowRowComponent
} from './';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlowService } from 'app/entities/flow/flow.service';
import { Components } from 'app/shared/camel/component-type';

const ENTITY_STATES = [...flowRoute, ...flowPopupRoute];

@NgModule({
    imports: [
        GatewaySharedModule,
        GatewayFromEndpointModule,
        GatewayToEndpointModule,
        GatewayErrorEndpointModule,
        GatewayServiceModule,
        GatewaySecurityModule,
        GatewayHeaderModule,
        GatewayMaintenanceModule,
        RouterModule.forChild(ENTITY_STATES),
        NgbModule,
        NgSelectModule,
        FormsModule,
        ReactiveFormsModule,
        PopoverModule.forRoot()
    ],
    exports: [FlowComponent],
    declarations: [
        FlowComponent,
        FlowUpdateComponent,
        FlowEditAllComponent,
        FlowConfigurationComponent,
        FlowDetailComponent,
        FlowDeleteDialogComponent,
        FlowDeletePopupComponent,
        FlowConfigurationComponent,
        FlowRowComponent,
        FlowSearchByNamePipe
    ],
    entryComponents: [
        FlowComponent,
        FlowUpdateComponent,
        FlowEditAllComponent,
        FlowDeleteDialogComponent,
        FlowConfigurationComponent,
        FlowDeleteDialogComponent,
        FlowDeletePopupComponent,
        FlowConfigurationComponent
    ],
    providers: [FlowService, FlowPopupService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayFlowModule {}
