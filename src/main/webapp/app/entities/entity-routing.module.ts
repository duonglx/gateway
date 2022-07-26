import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { BrokerModule } from './broker/broker.module';
import { CertificateModule } from './certificate/certificate.module';
import { StepModule } from './step/step.module';
import { EnvironmentVariablesModule } from './environment-variables/environment-variables.module';
import { FlowModule } from './flow/flow.module';
import { GatewayModule } from './gateway/gateway.module';
import { GroupModule } from './group/group.module';
import { HeaderModule } from './header/header.module';
import { HeaderKeysModule } from './header-keys/header-keys.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { QueueModule } from './queue/queue.module';
import { RouteModule } from './route/route.module';
import { ServiceModule } from './service/service.module';
import { ServiceKeysModule } from './service-keys/service-keys.module';
import { TopicModule } from './topic/topic.module';

import { DeploymentService } from 'app/admin/deployment/deployment.service';
/* jhipster-needle-add-entity-module-import - JHipster will add entity modules imports here */

@NgModule({
  // prettier-ignore
  imports: [
        BrokerModule,
		CertificateModule,
        StepModule,
		EnvironmentVariablesModule,
		FlowModule,
		GatewayModule,
        GroupModule,
        HeaderModule,
        HeaderKeysModule,
        MaintenanceModule,
		QueueModule,
        RouteModule,
        ServiceModule,
        ServiceKeysModule,
		TopicModule,
        /* jhipster-needle-add-entity-module - JHipster will add entity modules here */
    ],
  exports: [
        BrokerModule,
		CertificateModule,
        StepModule,
		EnvironmentVariablesModule,
		FlowModule,
		GatewayModule,
        GroupModule,
        HeaderModule,
        HeaderKeysModule,
        MaintenanceModule,
		QueueModule,
        RouteModule,
        ServiceModule,
        ServiceKeysModule,
		TopicModule,
    /* jhipster-needle-add-entity-module - JHipster will add entity modules here */
  ],
  declarations: [],
  entryComponents: [],
  providers: [DeploymentService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EntityRoutingModule {}
