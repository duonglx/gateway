/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { GatewayTestModule } from '../../../test.module';
import { HeaderDetailComponent } from 'app/entities/message/message-detail.component';
import { Header } from 'app/shared/model/message.model';

describe('Component Tests', () => {
    describe('Header Management Detail Component', () => {
        let comp: HeaderDetailComponent;
        let fixture: ComponentFixture<HeaderDetailComponent>;
        const route = ({ data: of({ message: new Header(123) }) } as any) as ActivatedRoute;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [GatewayTestModule],
                declarations: [HeaderDetailComponent],
                providers: [{ provide: ActivatedRoute, useValue: route }]
            })
                .overrideTemplate(HeaderDetailComponent, '')
                .compileComponents();
            fixture = TestBed.createComponent(HeaderDetailComponent);
            comp = fixture.componentInstance;
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(comp.message).toEqual(jasmine.objectContaining({ id: 123 }));
            });
        });
    });
});
