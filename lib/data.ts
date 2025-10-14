import * as Icon from 'lucide-react';

export const DATA = {
  sidebar: [
    {
      title: 'Dashboard',
      url: '/',
      icon: Icon.LayoutDashboard,
    },
    {
      title: 'Employee Management',
      icon: Icon.BadgeIndianRupee,
      children: [
        {
          title: 'Employee',
          url: '/employee-management/employee-list',
          icon: Icon.HandCoins,
        },
        {
          title: 'Employee Role',
          url: '/employee-management/employee-rolelist',
          icon: Icon.HandCoins,
        },
        {
          title: 'Permissions',
          url: '/employee-management/permission-list',
          icon: Icon.HandCoins,
        },
        {
          title: 'Employee Permissions',
          url: '/employee-management/emp-permissionlist',
          icon: Icon.HandCoins,
        },
        {
          title: 'Employee Document Upload',
          url: '/employee-management/document-upload',
          icon: Icon.HandCoins,
        },
        {
          title: 'Employee Document List',
          url: '/employee-management/document-list',
          icon: Icon.HandCoins,
        },
        {
          title: 'Document Type',
          url: '/employee-management/document-typelist',
          icon: Icon.HandCoins,
        },
      ],
    },
    {
      title: 'Customer Management',
      icon: Icon.Users,
      children: [
        {
          title: 'Customers', 
          url: '/customer',
          icon: Icon.User,
        },
        
        
      ],
    },

    {
      title: 'Orders',
      icon: Icon.Warehouse,
      children: [
        {
          title: 'Create Order', 
          url: '/orders/create-order',
          icon: Icon.Handshake,
        },
        {
          title: 'Order list', 
          url: '/orders/order-list',
          icon: Icon.Handshake,
        },
        
      ],
    },
    
    {
      title: 'Delivery',
      icon: Icon.Truck,
      children: [
        {
          title: 'Delivery Time Slots', 
          url: '/delivery/delivery-time-slots',
          icon: Icon.Clock,
        },
        {
          title: 'Delivery Assign', 
          url: '/delivery/delivery-assign',
          icon: Icon.Clock,
        },
      ],
    },

    {
      title: 'Banner',
      icon: Icon.Badge,
      children: [
        {
          title: 'Create Banner', 
          url: '/banner/create-banner',
          icon: Icon.Clock,
        },
        {
          title: 'Banner List', 
          url: '/banner/banner-list',
          icon: Icon.Clock,
        },
      ],
    },

    {
      title: 'Coupon & Offers',
      icon: Icon.AwardIcon,
      children: [
        {
          title: 'Coupon Create', 
          url: '/offers/coupon-list',
          icon: Icon.Clock,
        },
        {
          title: 'Offer Create', 
          url: '/offers/offers-list',
          icon: Icon.Clock,
        },
      ],
    },

    {
      title: 'Membership',
      icon: Icon.Handshake,
      children: [
        {
          title: 'Membership Plans', 
          url: '/membership/membership-plans-list',
          icon: Icon.Handshake,
        },
        {
          title: 'Membership Tier', 
          url: '/membership/membership-tier-list',
          icon: Icon.Handshake,
        },
        {
          title: 'Benefits', 
          url: '/membership/benefit-list',
          icon: Icon.Handshake,
        },
      ],
      
    },
    {
      title: 'Contact & Support',
      url: '/contact-support/contact-list',
      icon: Icon.LayoutDashboard,
    },
    {
      title: 'Feedbacks',
      icon: Icon.MessageSquare,
      children: [
        {
          title: 'Customer Feedback', 
          url: '/feedbacks/customer-feedback',
          icon: Icon.MessageSquare,
        },
        {
          title: 'Feedback Category', 
          url: '/feedbacks/feedback-category',
          icon: Icon.MessageSquare,
        },
      ],
    },
  ],
};

