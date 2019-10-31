import { trigger, state, style, transition, animate, group, query, stagger, keyframes } from '@angular/animations';
import { NONE_TYPE } from '@angular/compiler/src/output/output_ast';

export const universalSearchTrigger = trigger('universalSearchState', [
  transition(':enter',
    [
      style({
        transform: 'translateY(-5%)',
        width: '0px',
        opacity: 0
      }),
      animate('400ms',
        keyframes([
          style({
            transform: 'translateY(-5%)',
            opacity: 0,
            width:  '*',
            offset: .5
          }),
          style({
            transform: 'translateY(0)',
            opacity: 1,
            offset: 1
          })
        ])
      )
    ]
  ),
  transition('* => void',
    query('.universal-search-result', [
      style({
        transform: 'scaleY(1)',
        opacity: 1
      }),
      animate('200ms ease',
        style({
          transform: 'scaleY(0)',
          opacity: 1
        })
      )], { optional: true })
  ),
]);


