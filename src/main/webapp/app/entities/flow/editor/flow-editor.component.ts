import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'jhi-flow-editor',
  templateUrl: './flow-editor.component.html'
})
export class FlowEditorComponent implements OnInit {

  editor: string = 'unknown';

  constructor(
	private route: ActivatedRoute,
    private router: Router,
  ) {}

    ngOnInit() {

		this.route.params.subscribe(params => {
   		    if (params['editor'] === 'connector') {
				this.editor = 'connector';
		    } else if(params['editor'] === 'esb'){
			    this.editor = 'esb';
		    } else if(params['editor'] === 'api'){
			    this.editor = 'api';
		    }	  
		});
		
	}

}

export class Option {
  constructor(public key?: string, public value?: string) {}
}

export class TypeLinks {
  constructor(public name: string, public assimblyTypeLink: string, public camelTypeLink: string) {}
}
