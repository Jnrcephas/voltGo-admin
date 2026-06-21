import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PayoutRow {
  riderId: string;
  riderName: string;
  avatar: string;
  amount: number;
  method: string;
  status: 'Paid' | 'Pending' | 'Failed';
  date: string;
}

interface TransactionRow {
  txnId: string;
  customer: string;
  type: 'Bundle Purchase' | 'Pay-Per-Delivery' | 'Refund' | 'Top-up';
  method: string;
  amount: number;
  status: 'Success' | 'Pending' | 'Failed';
  date: string;
}

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.css']
})
export class FinanceComponent {

  activeTab: 'transactions' | 'payouts' = 'transactions';

  stats = [
    { label: 'Revenue Today',     value: 'GHS 4,000',  change: '+9%',  positive: true,  icon: 'ri-money-dollar-circle-fill', color: 'green'  },
    { label: 'Revenue This Week', value: 'GHS 26,400', change: '+14%', positive: true,  icon: 'ri-line-chart-line',          color: 'blue'   },
    { label: 'Pending Payouts',   value: 'GHS 8,120',  change: '+3%',  positive: false, icon: 'ri-hourglass-line',           color: 'orange' },
    { label: 'Failed Transactions', value: '6',        change: '-2%',  positive: true,  icon: 'ri-error-warning-fill',       color: 'red'    },
  ];

  weeklyRevenue = [
    { day: 'Mon', value: 3200 },
    { day: 'Tue', value: 4100 },
    { day: 'Wed', value: 2950 },
    { day: 'Thu', value: 4800 },
    { day: 'Fri', value: 5600 },
    { day: 'Sat', value: 6900 },
    { day: 'Sun', value: 4000 },
  ];
  get maxRevenue(): number {
    return Math.max(...this.weeklyRevenue.map(d => d.value));
  }

  paymentSplit = [
    { method: 'MTN MoMo',        percent: 52, color: '#ffc107' },
    { method: 'Vodafone Cash',   percent: 21, color: '#ef4444' },
    { method: 'AirtelTigo Money', percent: 14, color: '#3b82f6' },
    { method: 'Card (Paystack)', percent: 13, color: '#8b5cf6' },
  ];

  searchTerm = '';
  statusFilter = 'All';
  typeFilter = 'All';

  transactions: TransactionRow[] = [
    { txnId: 'TXN-88213', customer: 'Camera Barnlu',  type: 'Bundle Purchase',   method: 'MTN MoMo',        amount: 200,  status: 'Success', date: 'Jun 18, 2026' },
    { txnId: 'TXN-88214', customer: 'Benson Opoku',   type: 'Pay-Per-Delivery',  method: 'Vodafone Cash',   amount: 25,   status: 'Success', date: 'Jun 18, 2026' },
    { txnId: 'TXN-88215', customer: 'Argan Oliver',   type: 'Refund',            method: 'Card (Paystack)', amount: -45,  status: 'Pending', date: 'Jun 18, 2026' },
    { txnId: 'TXN-88216', customer: 'Parfumer Jacob', type: 'Top-up',            method: 'MTN MoMo',        amount: 480,  status: 'Success', date: 'Jun 17, 2026' },
    { txnId: 'TXN-88217', customer: 'Linda Mensah',   type: 'Bundle Purchase',   method: 'AirtelTigo Money',amount: 75,   status: 'Failed',  date: 'Jun 17, 2026' },
    { txnId: 'TXN-88218', customer: 'Kojo Asante',    type: 'Pay-Per-Delivery',  method: 'Card (Paystack)', amount: 30,   status: 'Success', date: 'Jun 17, 2026' },
    { txnId: 'TXN-88219', customer: 'Ama Serwaa',     type: 'Bundle Purchase',   method: 'MTN MoMo',        amount: 1000, status: 'Success', date: 'Jun 16, 2026' },
  ];

  payouts: PayoutRow[] = [
    { riderId: 'RD-1042', riderName: 'Eddie Lobanovskiy', avatar: 'https://i.pravatar.cc/36?img=11', amount: 640, method: 'MTN MoMo',         status: 'Paid',    date: 'Jun 16, 2026' },
    { riderId: 'RD-1043', riderName: 'Alexey Stave',      avatar: 'https://i.pravatar.cc/36?img=12', amount: 412, method: 'Vodafone Cash',    status: 'Paid',    date: 'Jun 16, 2026' },
    { riderId: 'RD-1044', riderName: 'Anton Tkacheve',    avatar: 'https://i.pravatar.cc/36?img=13', amount: 388, method: 'MTN MoMo',         status: 'Pending', date: 'Jun 16, 2026' },
    { riderId: 'RD-1045', riderName: 'Kwesi Boateng',     avatar: 'https://i.pravatar.cc/36?img=15', amount: 290, method: 'AirtelTigo Money', status: 'Failed',  date: 'Jun 16, 2026' },
    { riderId: 'RD-1046', riderName: 'Yaw Darko',         avatar: 'https://i.pravatar.cc/36?img=16', amount: 510, method: 'MTN MoMo',         status: 'Paid',    date: 'Jun 16, 2026' },
  ];

  setTab(tab: 'transactions' | 'payouts') {
    this.activeTab = tab;
  }

  get filteredTransactions(): TransactionRow[] {
    return this.transactions.filter(t => {
      const matchesSearch = t.customer.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                             t.txnId.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.statusFilter === 'All' || t.status === this.statusFilter;
      const matchesType = this.typeFilter === 'All' || t.type === this.typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }

  get filteredPayouts(): PayoutRow[] {
    return this.payouts.filter(p => {
      const matchesSearch = p.riderName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                             p.riderId.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.statusFilter === 'All' || p.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }
}