// import { DisElement } from './../MOCK_DATA';
import { ComponentRef, Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { Overlay, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { TooltipComponent } from './tooltip/tooltip.component';

@Directive({ selector: '[infoTooltip]' })
export class TooltipDirective implements OnInit {
  @Input ('toolTipDisplay') isDisplay: boolean = true;
  @Input('infoTooltip') tipInfo: {tipType: string, tipTitle: string, content: any};
  private overlayRef: OverlayRef;

  constructor(private overlay: Overlay,
              private overlayPositionBuilder: OverlayPositionBuilder,
              private elementRef: ElementRef) {
  }

  ngOnInit(): void {
    const positionStrategy = this.overlayPositionBuilder
      .flexibleConnectedTo(this.elementRef)
      .withPositions([{
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom',
        offsetY: -10,
      }]);

    this.overlayRef = this.overlay.create({ positionStrategy });
  }

  @HostListener('mouseenter')
  show() {
    if(!this.isDisplay) 
      return;
    const tooltipRef: ComponentRef<TooltipComponent>
      =  this.isDisplay && this.overlayRef.attach(new ComponentPortal(TooltipComponent));
    tooltipRef.instance.tipInfo = this.tipInfo;
  }

  @HostListener('mouseout')
  hide() {
    this.overlayRef.detach();
  }
}
