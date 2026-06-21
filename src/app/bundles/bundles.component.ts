import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface BundleTier {
  id: string;
  name: string;
  credits: number;
  price: number;
  validity: number;
  savings: number;
  active: boolean;
  subscribers: number;
  color: string;
}

interface SubscriptionRow {
  customer: string;
  avatar: string;
  tier: string;
  creditsTotal: number;
  creditsRemaining: number;
  expiresAt: string;
  autoRenew: boolean;
  status: 'Active' | 'Expiring Soon' | 'Expired';
}

@Component({
  selector: 'app-bundles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bundles.component.html',
  styleUrls: ['./bundles.component.css']
})
export class BundlesComponent {

  stats = [
    { label: 'Active Bundles',     value: '1,284', change: '+7%',  positive: true,  icon: 'ri-gift-fill',          color: 'green'  },
    { label: 'Bundle Revenue (Mo)', value: 'GHS 96,400', change: '+11%', positive: true, icon: 'ri-money-dollar-circle-fill', color: 'blue' },
    { label: 'Avg Adoption Rate',  value: '64%',   change: '+5%',  positive: true,  icon: 'ri-user-follow-fill',   color: 'purple' },
    { label: 'Expiring This Week', value: '38',    change: '+9%',  positive: false, icon: 'ri-alarm-warning-fill', color: 'orange' },
  ];

  bundleTiers: BundleTier[] = [
    { id: 'starter',    name: 'Starter Pack',  credits: 5,   price: 75,   validity: 30,  savings: 5,  active: true, subscribers: 412, color: '#3b82f6' },
    { id: 'biz-lite',   name: 'Business Lite', credits: 15,  price: 200,  validity: 60,  savings: 12, active: true, subscribers: 318, color: '#8b5cf6' },
    { id: 'biz-pro',    name: 'Business Pro',  credits: 40,  price: 480,  validity: 90,  savings: 20, active: true, subscribers: 196, color: '#f97316' },
    { id: 'enterprise', name: 'Enterprise',    credits: 100, price: 1000, validity: 180, savings: 30, active: true, subscribers: 64,  color: '#22c55e' },
  ];

  searchTerm = '';
  tierFilter = 'All';
  statusFilter = 'All';

  subscriptions: SubscriptionRow[] = [
    { customer: 'Camera Barnlu',  avatar: 'https://i.pravatar.cc/36?img=21', tier: 'Business Pro',  creditsTotal: 40, creditsRemaining: 28, expiresAt: 'Jul 12, 2026', autoRenew: true,  status: 'Active' },
    { customer: 'Benson Opoku',   avatar: 'https://i.pravatar.cc/36?img=22', tier: 'Starter Pack',  creditsTotal: 5,  creditsRemaining: 1,  expiresAt: 'Jun 21, 2026', autoRenew: false, status: 'Expiring Soon' },
    { customer: 'Argan Oliver',   avatar: 'https://i.pravatar.cc/36?img=23', tier: 'Business Lite', creditsTotal: 15, creditsRemaining: 0,  expiresAt: 'Jun 10, 2026', autoRenew: false, status: 'Expired' },
    { customer: 'Parfumer Jacob', avatar: 'https://i.pravatar.cc/36?img=24', tier: 'Enterprise',    creditsTotal: 100,creditsRemaining: 76, expiresAt: 'Sep 02, 2026', autoRenew: true,  status: 'Active' },
    { customer: 'Linda Mensah',   avatar: 'https://i.pravatar.cc/36?img=25', tier: 'Business Pro',  creditsTotal: 40, creditsRemaining: 3,  expiresAt: 'Jun 20, 2026', autoRenew: true,  status: 'Expiring Soon' },
  ];

  showCreateModal = false;

  newBundle: Partial<BundleTier> = {
    name: '', credits: 5, price: 75, validity: 30, savings: 0, active: true
  };

  openCreateModal() {
    this.newBundle = { name: '', credits: 5, price: 75, validity: 30, savings: 0, active: true };
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  saveBundle() {
    if (!this.newBundle.name || !this.newBundle.credits || !this.newBundle.price) return;
    this.bundleTiers.push({
      id: 'custom-' + Date.now(),
      name: this.newBundle.name!,
      credits: this.newBundle.credits!,
      price: this.newBundle.price!,
      validity: this.newBundle.validity || 30,
      savings: this.newBundle.savings || 0,
      active: true,
      subscribers: 0,
      color: '#06b6d4'
    });
    this.closeCreateModal();
  }

  toggleBundleActive(bundle: BundleTier) {
    bundle.active = !bundle.active;
  }

  get filteredSubscriptions(): SubscriptionRow[] {
    return this.subscriptions.filter(s => {
      const matchesSearch = s.customer.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesTier = this.tierFilter === 'All' || s.tier === this.tierFilter;
      const matchesStatus = this.statusFilter === 'All' || s.status === this.statusFilter;
      return matchesSearch && matchesTier && matchesStatus;
    });
  }
}