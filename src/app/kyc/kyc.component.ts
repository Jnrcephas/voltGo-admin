import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface KycSubmission {
  id: string;
  applicantName: string;
  avatar: string;
  phone: string;
  vehicleType: 'Bicycle' | 'E-Motorcycle';
  ghanaCardNo: string;
  ghanaCardFront: string;
  ghanaCardBack: string;
  driversLicense: string | null;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  rejectionReason?: string;
}

@Component({
  selector: 'app-kyc',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kyc.component.html',
  styleUrls: ['./kyc.component.css']
})
export class KycComponent {

  stats = [
    { label: 'Pending Review', value: '11', change: '+3',  positive: false, icon: 'ri-file-shield-2-line',   color: 'orange' },
    { label: 'Approved (30d)', value: '64', change: '+12', positive: true,  icon: 'ri-checkbox-circle-fill', color: 'green'  },
    { label: 'Rejected (30d)', value: '7',  change: '-1',  positive: true,  icon: 'ri-close-circle-fill',    color: 'red'    },
    { label: 'Avg Review Time', value: '6.2h', change: '-18%', positive: true, icon: 'ri-time-line',         color: 'blue'   },
  ];

  searchTerm = '';
  statusFilter = 'Pending';

  submissions: KycSubmission[] = [
    {
      id: 'KYC-3301', applicantName: 'Linda Mensah', avatar: 'https://i.pravatar.cc/48?img=25',
      phone: '+233 24 666 7788', vehicleType: 'E-Motorcycle', ghanaCardNo: 'GHA-394057261-5',
      ghanaCardFront: 'https://placehold.co/400x250/eef2ff/4338ca?text=Ghana+Card+Front',
      ghanaCardBack: 'https://placehold.co/400x250/eef2ff/4338ca?text=Ghana+Card+Back',
      driversLicense: 'https://placehold.co/400x250/fef3c7/92400e?text=Drivers+License',
      submittedAt: 'Jun 19, 2026 · 09:14 AM', status: 'Pending'
    },
    {
      id: 'KYC-3302', applicantName: 'Kojo Asante', avatar: 'https://i.pravatar.cc/48?img=18',
      phone: '+233 24 777 8899', vehicleType: 'Bicycle', ghanaCardNo: 'GHA-283746159-6',
      ghanaCardFront: 'https://placehold.co/400x250/eef2ff/4338ca?text=Ghana+Card+Front',
      ghanaCardBack: 'https://placehold.co/400x250/eef2ff/4338ca?text=Ghana+Card+Back',
      driversLicense: null,
      submittedAt: 'Jun 18, 2026 · 03:40 PM', status: 'Pending'
    },
    {
      id: 'KYC-3290', applicantName: 'Esi Owusu', avatar: 'https://i.pravatar.cc/48?img=31',
      phone: '+233 24 888 9900', vehicleType: 'E-Motorcycle', ghanaCardNo: 'GHA-110293847-7',
      ghanaCardFront: 'https://placehold.co/400x250/eef2ff/4338ca?text=Ghana+Card+Front',
      ghanaCardBack: 'https://placehold.co/400x250/eef2ff/4338ca?text=Ghana+Card+Back',
      driversLicense: 'https://placehold.co/400x250/fef3c7/92400e?text=Drivers+License',
      submittedAt: 'Jun 14, 2026 · 11:02 AM', status: 'Approved'
    },
    {
      id: 'KYC-3287', applicantName: 'Nana Yeboah', avatar: 'https://i.pravatar.cc/48?img=33',
      phone: '+233 24 999 0011', vehicleType: 'Bicycle', ghanaCardNo: 'GHA-998877665-8',
      ghanaCardFront: 'https://placehold.co/400x250/eef2ff/4338ca?text=Ghana+Card+Front',
      ghanaCardBack: 'https://placehold.co/400x250/eef2ff/4338ca?text=Ghana+Card+Back',
      driversLicense: null,
      submittedAt: 'Jun 11, 2026 · 02:15 PM', status: 'Rejected', rejectionReason: 'Ghana Card image blurred / unreadable'
    },
  ];

  selectedSubmission: KycSubmission | null = null;
  showRejectModal = false;
  rejectReasonText = '';

  get filteredSubmissions(): KycSubmission[] {
    return this.submissions.filter(s => {
      const matchesSearch = s.applicantName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                             s.id.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.statusFilter === 'All' || s.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  reviewSubmission(s: KycSubmission) {
    this.selectedSubmission = s;
  }

  closeReview() {
    this.selectedSubmission = null;
  }

  approve() {
    if (this.selectedSubmission) {
      this.selectedSubmission.status = 'Approved';
      this.closeReview();
    }
  }

  openRejectModal() {
    this.rejectReasonText = '';
    this.showRejectModal = true;
  }

  closeRejectModal() {
    this.showRejectModal = false;
  }

  confirmReject() {
    if (this.selectedSubmission && this.rejectReasonText.trim()) {
      this.selectedSubmission.status = 'Rejected';
      this.selectedSubmission.rejectionReason = this.rejectReasonText;
      this.closeRejectModal();
      this.closeReview();
    }
  }
}