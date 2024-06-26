import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { QueueService } from './queue.service';
import { Address, IAddress } from 'app/shared/model/address.model';
import { IBroker } from 'app/shared/model/broker.model';

@Component({
    selector: 'jhi-queue-update',
    templateUrl: './queue-update.component.html'
})
export class QueueUpdateComponent implements OnInit {
    isSaving = false;
    isClose: boolean;
    namePopoverMessage: string;

    editForm: FormGroup;

    brokerType = '';
    brokers: IBroker[];

    constructor(
        protected queueService: QueueService,
        protected activatedRoute: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder
    ) {
        this.brokers = [];
    }

    ngOnInit(): void {
        this.activatedRoute.data.subscribe(({ address }) => {
            this.initForm();
            if (address) {
                this.updateForm(address);
            }
        });
        this.getBrokerType();
        this.namePopoverMessage = 'Name of the queue. Use a comma-separated list to add multiple queues';
    }

    initForm() {
        this.editForm = this.formBuilder.group({
            address: new FormControl(''),
            name: new FormControl(''),
            numberOfConsumers: new FormControl(''),
            numberoftimes: new FormControl(''),
            numberOfMessages: new FormControl(''),
            size: new FormControl(''),
            temporary: new FormControl('')
        });
    }

    updateForm(address: IAddress): void {
        this.editForm.patchValue({
            address: address.address,
            name: address.name,
            numberOfConsumers: address.numberOfConsumers,
            numberOfMessages: address.numberOfMessages,
            size: address.size,
            temporary: address.temporary
        });
    }

    previousState(): void {
        window.history.back();
    }

    save(): void {
        this.isSaving = true;

        const address = this.createFromForm();

        const queueNames = address.name.split(',');

        if (queueNames) {
            for (let i = 0; i < queueNames.length; i++) {
                if (i === queueNames.length - 1) {
                    this.isClose = true;
                    const queue = queueNames[i].trim();
                    this.subscribeToSaveResponse(this.queueService.createQueue(queue, this.brokerType));
                } else {
                    this.isClose = false;
                    const queue = queueNames[i].trim();
                    this.subscribeToSaveResponse(this.queueService.createQueue(queue, this.brokerType));
                }
            }
        } else {
            this.isClose = true;
            this.subscribeToSaveResponse(this.queueService.createQueue(address.name, this.brokerType));
        }
    }

    private createFromForm(): IAddress {
        return {
            ...new Address(),
            address: this.editForm.get(['address'])!.value,
            name: this.editForm.get(['name'])!.value,
            numberOfConsumers: this.editForm.get(['numberOfConsumers'])!.value,
            numberOfMessages: this.editForm.get(['numberOfMessages'])!.value,
            size: this.editForm.get(['size'])!.value,
            temporary: this.editForm.get(['temporary'])!.value
        };
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<any>>): void {
        result.subscribe(
            () => this.onSaveSuccess(),
            () => this.onSaveError()
        );
    }

    protected onSaveSuccess(): void {
        if (this.isClose) {
            this.isSaving = false;
            this.router.navigate(['/queue']);
        }
    }

    protected onSaveError(): void {
        this.isSaving = false;
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
