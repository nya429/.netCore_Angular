import { trigger, state, style, transition, animate, group, query, stagger, keyframes } from '@angular/animations';



const listItemSlideStateTrigger =
    trigger('listItemSlideState', [
        // state('default', style({
        //     opacity: 1,
        //     transform: 'translateX(0)'
        // })),
        // state('removal', style({
        //     opacity: 0,
        //     transform: 'translateX(20%)',
        //     offset: 1
        // })),
        transition('* => *',
            //  animate('400ms ease-out')
            [
                // query(':enter', [
                //     style({
                //         opacity: 0,
                //         transform: 'translateX(-10%)'
                //     }),
                //     stagger(40,
                //         animate('350ms ease-out', keyframes([
                //             style({
                //                 opacity: 0,
                //                 transform: 'translateX(-10%)',
                //                 offset: 0
                //             }),
                //             style({
                //                 opacity: .8,
                //                 transform: 'translateX(3%)',
                //                 offset: .5
                //             }),
                //             style({
                //                 opacity: 1,
                //                 transform: 'translateX(0)',
                //                 offset: 1
                //             }),
                //         ])
                //         ),
                //     )
                // ], { optional: true }),
                query(':leave', [
                    style({
                        opacity: 1,
                        transform: 'translateX(0)'
                    }),
                    animate('250ms ease-out',
                        keyframes([
                            style({
                                opacity: 1,
                                transform: 'translateX(-2%)',
                                offset: .3
                            }),
                            style({
                                opacity: 0,
                                transform: 'translateX(20%)',
                                offset: 1
                            })
                        ]))
                ], { optional: true }),
            ]
        )
    ]);

const failScaleTrigger = trigger('scale', [
    state('fail', style({})),
    state('default', style({})),
    state('removal', style({ transform: 'translateX(0)' })),
    transition('fail => default', animate('500ms',
        keyframes([
            style({ transform: 'translateX(0)' }),
            style({ transform: 'translateX(-2%)' }),
            style({ transform: 'translateX(4%)' }),
            style({ transform: 'translateX(-3%)' }),
            style({ transform: 'translateX(1%)' }),
            style({ transform: 'translateX(0)' }),
        ])
    )),
    transition('default => authed', animate('400ms 100ms ease-out', keyframes([
        style({ transform: 'translateX(1.1)', offset: 0.7 }),
        style({ transform: 'translateX(0)', offset: 1 }),
    ])))
]);

const slideInTrigger = trigger('slideInState', [
    transition(':enter', [
        style({
            opacity: 0,
            transform: 'translateY(-2%)'
        }),
        animate(200, style({
            opacity: 1,
            transform: 'translateX(0)'
        }))
    ]),
    transition(':leave', [
        style({
            opacity: 1,
            transform: 'translateY(0)'
        }),
        animate(200, style({
            opacity: 0,
            transform: 'translateY(-5%)'
        }))
    ]),
]);

 const fadeAnimation = trigger('fadeAnimation', [
    transition('* => *', [
    //   query(
    //     ':enter',
    //     [style({ opacity: 0 })],
    //     { optional: true }
    //   ),
      query(
        ':leave',
        [style({ opacity: 1 }), animate('0.5s', style({ opacity: 0 }))],
        { optional: true }
      ),
      query(
        ':enter',
        [style({ opacity: 0 }), animate('0.5s', style({ opacity: 1 }))],
        { optional: true }
      )
    ])
  ]);


  const buttonEditSlideTrigger =  trigger('button-edit-slide', [
    transition(':enter', [
      style({ opacity: 0 , transform: 'translateY(20px)' }),
      animate("200ms ease-out", style({ opacity: 1,  transform: 'translateY(0)' })),
    ]),
    transition(':leave', [
      animate(100, style({ opacity: 0, transform: 'translateY(20px)' })),
    ]),
  ]);

export { listItemSlideStateTrigger, failScaleTrigger, slideInTrigger, fadeAnimation, buttonEditSlideTrigger };
