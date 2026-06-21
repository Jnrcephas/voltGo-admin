import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Customer {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  city: string;
  bundleTier: string | null;
  totalOrders: number;
  totalSpend: number;
  accountStatus: 'Active' | 'Flagged' | 'Suspended';
  joinedDate: string;
  lastOrder: string;
}

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent {

  stats = [
    { label: 'Total Customers', value: '3,418', change: '+5%',  positive: true,  icon: 'ri-group-fill',          color: 'blue'   },
    { label: 'Active Bundles',  value: '1,284', change: '+7%',  positive: true,  icon: 'ri-gift-fill',           color: 'green'  },
    { label: 'Flagged Accounts', value: '6',    change: '+2',   positive: false, icon: 'ri-flag-2-fill',         color: 'red'    },
    { label: 'Pending Refunds', value: '4',     change: '-1',   positive: true,  icon: 'ri-refund-2-line',       color: 'orange' },
  ];

  searchTerm = '';
  statusFilter = 'All';
  tierFilter = 'All';

  customers: Customer[] = [
    { id: 'CU-5001', name: 'Camera Barnlu',  avatar: 'https://i.pravatar.cc/48?img=21', phone: '+233 20 111 2233', email: 'cbarnlu@gmail.com',  city: 'Madina',     bundleTier: 'Business Pro',  totalOrders: 84,  totalSpend: 2940, accountStatus: 'Active',    joinedDate: 'Oct 02, 2025', lastOrder: 'Jun 18, 2026' },
    { id: 'CU-5002', name: 'Benson Opoku',   avatar: 'https://i.pravatar.cc/48?img=22', phone: '+233 20 222 3344', email: 'bopoku@gmail.com',   city: 'Lapaz',      bundleTier: 'Starter Pack',  totalOrders: 12,  totalSpend: 420,  accountStatus: 'Active',    joinedDate: 'Mar 18, 2026', lastOrder: 'Jun 18, 2026' },
    { id: 'CU-5003', name: 'Argan Oliver',   avatar: 'https://i.pravatar.cc/48?img=23', phone: '+233 20 333 4455', email: 'aoliver@gmail.com',  city: 'Kasoa',      bundleTier: null,            totalOrders: 31,  totalSpend: 980,  accountStatus: 'Flagged',   joinedDate: 'Jan 09, 2026', lastOrder: 'Jun 17, 2026' },
    { id: 'CU-5004', name: 'Parfumer Jacob', avatar: 'https://i.pravatar.cc/48?img=24', phone: '+233 20 444 5566', email: 'pjacob@gmail.com',   city: 'East Legon', bundleTier: 'Enterprise',    totalOrders: 218, totalSpend: 11400, accountStatus: 'Active',   joinedDate: 'Aug 14, 2025', lastOrder: 'Jun 18, 2026' },
    { id: 'CU-5005', name: 'Linda Mensah',   avatar: 'https://i.pravatar.cc/48?img=26', phone: '+233 20 555 6677', email: 'lmensah2@gmail.com', city: 'Adenta',     bundleTier: 'Business Lite', totalOrders: 46,  totalSpend: 1640, accountStatus: 'Suspended', joinedDate: 'Feb 27, 2026', lastOrder: 'Jun 10, 2026' },
    { id: 'CU-5006', name: 'Kojo Asante',    avatar: 'https://i.pravatar.cc/48?img=28', phone: '+233 20 666 7788', email: 'kasante2@gmail.com', city: 'Madina',     bundleTier: null,            totalOrders: 5,   totalSpend: 150,  accountStatus: 'Active',    joinedDate: 'Jun 01, 2026', lastOrder: 'Jun 16, 2026' },
  ];

  selectedCustomer: Customer | null = null;
  editMode = false;
  editBuffer: Customer | null = null;

  get filteredCustomers(): Customer[] {
    return this.customers.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                             c.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                             c.phone.includes(this.searchTerm);
      const matchesStatus = this.statusFilter === 'All' || c.accountStatus === this.statusFilter;
      const matchesTier = this.tierFilter === 'All' ||
                           (this.tierFilter === 'No Bundle' && !c.bundleTier) ||
                           c.bundleTier === this.tierFilter;
      return matchesSearch && matchesStatus && matchesTier;
    });
  }

  viewCustomer(c: Customer) {
    this.selectedCustomer = c;
    this.editMode = false;
  }

  closeDrawer() {
    this.selectedCustomer = null;
    this.editMode = false;
    this.editBuffer = null;
  }

  startEdit() {
    if (this.selectedCustomer) {
      this.editBuffer = { ...this.selectedCustomer };
      this.editMode = true;
    }
  }

  cancelEdit() {
    this.editMode = false;
    this.editBuffer = null;
  }

  saveEdit() {
    if (this.editBuffer && this.selectedCustomer) {
      Object.assign(this.selectedCustomer, this.editBuffer);
      this.editMode = false;
      this.editBuffer = null;
    }
  }

  setStatus(c: Customer, status: 'Active' | 'Flagged' | 'Suspended') {
    c.accountStatus = status;
  }
}