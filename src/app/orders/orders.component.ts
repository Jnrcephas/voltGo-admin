import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface OrderRow {
  id: string;
  customer: string;
  rider: string | null;
  riderAvatar?: string;
  pickup: string;
  dropoff: string;
  zone: string;
  status: 'Pending' | 'Assigned' | 'In Transit' | 'Completed' | 'Cancelled';
  price: number;
  vehicleType: 'Bicycle' | 'E-Motorcycle';
  slaBreach: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent {

  stats = [
    { label: 'Active Orders',    value: '40',  change: '+12%', positive: true,  icon: 'ri-shopping-bag-fill',    color: 'orange' },
    { label: 'Unassigned',       value: '6',   change: '-2%',  positive: true,  icon: 'ri-error-warning-fill',   color: 'red'    },
    { label: 'SLA Breaches',     value: '3',   change: '+1%',  positive: false, icon: 'ri-alarm-warning-fill',   color: 'purple' },
    { label: 'Completed Today',  value: '40',  change: '+9%',  positive: true,  icon: 'ri-checkbox-circle-fill', color: 'green'  },
  ];

  searchTerm = '';
  statusFilter = 'All';
  zoneFilter = 'All';

  selectedOrder: OrderRow | null = null;
  showReassignModal = false;
  reassignTarget = '';

  availableRiders = [
    'Eddie Lobanovskiy', 'Alexey Stave', 'Anton Tkacheve', 'Kwesi Boateng', 'Yaw Darko'
  ];

  orders: OrderRow[] = [
    { id: '#876364', customer: 'Camera Barnlu',  rider: null,                  pickup: 'Madina station',  dropoff: 'Madina station', zone: 'Madina',     status: 'Pending',   price: 25, vehicleType: 'Bicycle',      slaBreach: false, createdAt: '10:14 AM' },
    { id: '#876368', customer: 'Benson Opoku',   rider: 'Alexey Stave',        riderAvatar: 'https://i.pravatar.cc/32?img=12', pickup: 'Lapaz Papaye', dropoff: 'Lapaz Papaye', zone: 'Lapaz', status: 'Cancelled', price: 30, vehicleType: 'E-Motorcycle', slaBreach: false, createdAt: '09:52 AM' },
    { id: '#876412', customer: 'Argan Oliver',   rider: 'Anton Tkacheve',      riderAvatar: 'https://i.pravatar.cc/32?img=13', pickup: 'Kasoa Weija',  dropoff: 'Kasoa Weija',  zone: 'Kasoa', status: 'Completed', price: 45, vehicleType: 'E-Motorcycle', slaBreach: false, createdAt: '09:30 AM' },
    { id: '#876621', customer: 'Parfumer Jacob', rider: 'Eddie Lobanovskiy',   riderAvatar: 'https://i.pravatar.cc/32?img=11', pickup: 'East Legon',   dropoff: 'East Legon',   zone: 'East Legon', status: 'Completed', price: 35, vehicleType: 'Bicycle', slaBreach: false, createdAt: '08:45 AM' },
    { id: '#876702', customer: 'Linda Mensah',   rider: 'Eddie Lobanovskiy',   riderAvatar: 'https://i.pravatar.cc/32?img=11', pickup: 'Adenta',       dropoff: 'East Legon',   zone: 'Adenta', status: 'In Transit', price: 50, vehicleType: 'E-Motorcycle', slaBreach: true,  createdAt: '11:02 AM' },
    { id: '#876705', customer: 'Kojo Asante',    rider: null,                  pickup: 'Madina station',  dropoff: 'Adenta',       zone: 'Madina', status: 'Pending', price: 28, vehicleType: 'Bicycle', slaBreach: true, createdAt: '11:10 AM' },
    { id: '#876710', customer: 'Ama Serwaa',     rider: 'Anton Tkacheve',      riderAvatar: 'https://i.pravatar.cc/32?img=13', pickup: 'East Legon',   dropoff: 'Lapaz',        zone: 'East Legon', status: 'Assigned',  price: 32, vehicleType: 'E-Motorcycle', slaBreach: false, createdAt: '11:20 AM' },
  ];

  get filteredOrders(): OrderRow[] {
    return this.orders.filter(o => {
      const matchesSearch = o.customer.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                             o.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                             (o.rider?.toLowerCase().includes(this.searchTerm.toLowerCase()) ?? false);
      const matchesStatus = this.statusFilter === 'All' || o.status === this.statusFilter;
      const matchesZone = this.zoneFilter === 'All' || o.zone === this.zoneFilter;
      return matchesSearch && matchesStatus && matchesZone;
    });
  }

  get zones(): string[] {
    return Array.from(new Set(this.orders.map(o => o.zone)));
  }

  openReassign(order: OrderRow) {
    this.selectedOrder = order;
    this.reassignTarget = order.rider || '';
    this.showReassignModal = true;
  }

  closeReassign() {
    this.showReassignModal = false;
    this.selectedOrder = null;
  }

  confirmReassign() {
    if (this.selectedOrder && this.reassignTarget) {
      this.selectedOrder.rider = this.reassignTarget;
      this.selectedOrder.status = 'Assigned';
    }
    this.closeReassign();
  }

  cancelOrder(order: OrderRow) {
    order.status = 'Cancelled';
  }
}