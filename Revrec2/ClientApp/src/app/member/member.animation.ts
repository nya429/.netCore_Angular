import { trigger, state, style, transition, animate, group, query, stagger, keyframes } from '@angular/animations';

export const columnExpandTrigger =  trigger('columnExpandTriggerState', [
    transition(':enter', 
        query('td, th', [
            style({
                width: '*',
                transform: 'scaleX(0)',
                backgroundColor: 'lightgrey' 
            }),
            animate('200ms 2500ms ease',             
                style({
                    width: '*',
                    transform: 'scaleX(1)',
                    backgroundColor: '*' 
                })
            )], {optional: true})
    ),
    transition(':leave', 
        query('td, th', [
            style({
                transform: 'scaleX(1)'
            }),
            animate('300ms 2000ms ease-out', style({
                transform: 'scaleX(0)'
            }))
        ], {optional: true})
    ),
    transition('* => *', [animate(300)])
]);


export const fadeAnimation = trigger('fadeAnimation', [
    transition('* => *', [
      query(
        ':enter',
        [style({ opacity: 0 })],
        { optional: true }
      ),
      query(
        ':leave',
        [style({ opacity: 1 }), animate('0.3s', style({ opacity: 0 }))],
        { optional: true }
      ),
      query(
        ':enter',
        [style({ opacity: 0 }), animate('0.3s', style({ opacity: 1 }))],
        { optional: true }
      )
    ])
  ]);

  export const slideOutAnimation = trigger('fadeAnimation', [
    transition('* => *', [
      query(
        ':enter',
        [style({ opacity: 0 })],
        { optional: true }
      ),
      query(
        ':leave',
        [style({ opacity: 1 }), animate('0.3s', style({ opacity: 0 }))],
        { optional: true }
      ),
      query(
        ':enter',
        [style({ opacity: 0 }), animate('0.3s', style({ opacity: 1 }))],
        { optional: true }
      )
    ])
  ]);
  
