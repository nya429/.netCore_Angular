import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

const failScaleTrigger =  trigger('scale', [
    state('authed',  style({transform: 'scale(0)'})),
    state('fail',  style({  })),
    state('default',  style({ })),
    transition('fail => default', animate('500ms',
        keyframes([
            style({transform: 'translateX(0)'}),
            style({transform: 'translateX(-2%)'}),
            style({transform: 'translateX(4%)'}),
            style({transform: 'translateX(-3%)'}),
            style({transform: 'translateX(1%)'}),
            style({transform: 'translateX(0)'}),
        ])
    )),
    transition('default => authed', animate('400ms ease-out', keyframes([
        style({transform: 'scale(1.2)', offset: 0.5}),
        style({transform: 'scale(0)', offset: 0.9}),
    ])))
]);


export {failScaleTrigger};
