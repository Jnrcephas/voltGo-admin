import { Component, Input } from '@angular/core';

/**
 * Shown at the top of pages that have no matching backend endpoint yet
 * (Fleet Tracking GPS, Dashcam, Messages, Customer Management, Rider
 * Payouts, most of Settings). These pages keep their original mock data so
 * the UI guy's design stays intact and demoable, but make it obvious to
 * whoever is testing that the data on screen isn't live.
 */
@Component({
  selector: 'app-mock-data-banner',
  standalone: true,
  template: `
    <div class="mock-banner">
      <i class="ri-flask-line"></i>
      <span>
        <strong>Preview data.</strong>
        {{ message }}
      </span>
    </div>
  `,
  styles: [
    `
      .mock-banner {
        display: flex;
        align-items: center;
        gap: 10px;
        background: #fff7ed;
        border: 1px solid #fed7aa;
        color: #9a3412;
        border-radius: 12px;
        padding: 12px 16px;
        font-size: 12.5px;
        font-weight: 500;
        margin-bottom: 18px;
      }
      .mock-banner i {
        font-size: 16px;
        flex-shrink: 0;
      }
      .mock-banner strong {
        font-weight: 700;
      }
    `,
  ],
})
export class MockDataBannerComponent {
  @Input() message = 'This page is not yet wired to a live backend endpoint — figures shown are sample data.';
}


