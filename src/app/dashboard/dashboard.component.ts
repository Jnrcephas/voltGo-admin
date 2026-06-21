import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  stats = [
    { label: 'Active Riders',    value: '78',       change: '+6%',  positive: true,  icon: 'ri-e-bike-fill',                color: 'blue'   },
    { label: 'Active Orders',    value: '40',       change: '+12%', positive: true,  icon: 'ri-shopping-bag-fill',          color: 'orange' },
    { label: 'Completed Today',  value: '40',       change: '-4%',  positive: false, icon: 'ri-checkbox-circle-fill',       color: 'purple' },
    { label: 'Earnings Today',   value: 'GHS 4000', change: '+9%',  positive: true,  icon: 'ri-money-dollar-circle-fill',   color: 'green'  },
  ];

  topRiders = [
    { name: 'Eddie Lobanovskiy', email: 'labanovskiy@gmail.com', count: 16, avatar: 'https://i.pravatar.cc/36?img=11' },
    { name: 'Alexey Stave',      email: 'alexeyst@gmail.com',    count: 10, avatar: 'https://i.pravatar.cc/36?img=12' },
    { name: 'Anton Tkacheve',    email: 'tkacheveanton@gmail.com', count: 9, avatar: 'https://i.pravatar.cc/36?img=13' },
    { name: 'Anton Tkacheve',    email: 'tkacheveanton@gmail.com', count: 4, avatar: 'https://i.pravatar.cc/36?img=14' },
  ];

  recentOrders = [
    { trackingNo: '#876364', riderName: 'Camera Barnlu',  pickup: 'Madina station', dropoff: 'Madina station', status: 'Pending'   },
    { trackingNo: '#876368', riderName: 'Benson Opoku',   pickup: 'Lapaz Papaye',   dropoff: 'Lapaz Papaye',   status: 'Cancelled' },
    { trackingNo: '#876412', riderName: 'Argan Oliver',   pickup: 'Kasoa Weija',    dropoff: 'Kasoa Weija',    status: 'Completed' },
    { trackingNo: '#876621', riderName: 'Parfumer Jacob', pickup: 'East Legon',     dropoff: 'East Legon',     status: 'Completed' },
  ];
}