'use client';
import { SidebarData } from '@/apis/auth.api';
import { useEffect } from 'react';

const sidebardata = () => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sidebardata = await SidebarData();
        console.log('sidebardata', sidebardata);
        localStorage.setItem('sidebarData', JSON.stringify(sidebardata));
      } catch (err) {
        console.log('Error fetching sidebar data:', err);
      }
    };
    fetchData();
  }, []);

  return <></>;
};

export default sidebardata;
