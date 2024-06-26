import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { ActivatedRoute, Router } from '@angular/router';

import { IQueue } from 'app/shared/model/queue.model';
import { QueueService } from './queue.service';
import { IAddress } from 'app/shared/model/address.model';
import { IBroker } from 'app/shared/model/broker.model';

@Component({
    templateUrl: './queue-delete-dialog.component.html'
})
export class QueueDeleteDialogComponent {
    queue?: IQueue;
    address?: IAddress;

    brokerType = '';
    brokers: IBroker[];

    message = 'Are you sure you want to delete this queue?';
    disableDelete: boolean;

    constructor(
        protected queueService: QueueService,
        public activeModal: NgbActiveModal,
        protected eventManager: EventManager,
        protected router: Router
    ) {
        this.brokers = [];
        this.getBrokerType();
        this.disableDelete = false;
    }

    cancel(): void {
        this.activeModal.dismiss();
    }

    confirmDelete(name: string): void {
        if (this.address.numberOfConsumers > 0) {
            this.message = 'Cannot delete queue because there is at least one active consumer';
            this.disableDelete = true;
        } else if (this.address.numberOfMessages > 0) {
            this.message = 'Cannot delete queue because there is at least one message on the queue. Please clear the queue before deleting';
            this.disableDelete = true;
        } else {
            this.queueService.deleteQueue(name, this.brokerType).subscribe(() => {
				this.eventManager.broadcast(new EventWithContent('queueListModification', 'deleted'));			
                 this.activeModal.dismiss(true);
            });
        }
    }

    getBrokerType(): void {
        this.queueService.getBrokers().subscribe(
            data => {
                if (data) {
                    for (const broker of data.body) {
                        this.brokers.push(broker);
                        this.brokerType = broker.type;
                    }
                }
            },
            error => console.log(error)
        );
    }
}