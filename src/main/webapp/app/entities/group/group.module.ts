import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewaySharedModule } from '../../shared';
// import { GatewayAdminModule } from '../../admin/admin.module';
import {
    GroupComponent,
    GroupDetailComponent,
    GroupUpdateComponent,
    GroupDeletePopupComponent,
    GroupDeleteDialogComponent,
    groupRoute,
    groupPopupRoute
} from './';

const ENTITY_STATES = [...groupRoute, ...groupPopupRoute];

@NgModule({
    imports: [
        GatewaySharedModule,
        // GatewayAdminModule,
        RouterModule.forChild(ENTITY_STATES)
    ],
    declarations: [GroupComponent, GroupUpdateComponent, GroupDetailComponent, GroupDeleteDialogComponent, GroupDeletePopupComponent],
    entryComponents: [GroupComponent, GroupUpdateComponent, GroupDetailComponent, GroupDeleteDialogComponent, GroupDeletePopupComponent],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayGroupModule {}
