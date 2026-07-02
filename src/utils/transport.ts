import type { TripPOI } from '@/data/mock';

export interface TransportInfo {
  distance: number;
  duration: number;
  walkDistance: number;
  walkDuration: number;
  transitDuration: number;
  taxiDuration: number;
  taxiCost: number;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function calculateDistance(
  lat1: number | undefined,
  lon1: number | undefined,
  lat2: number | undefined,
  lon2: number | undefined
): number {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return 2;
  }
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function calculateTransport(poi1: TripPOI, poi2: TripPOI): TransportInfo {
  const distance = calculateDistance(poi1.latitude, poi1.longitude, poi2.latitude, poi2.longitude);
  
  const walkSpeed = 5;
  const transitSpeed = 25;
  const taxiSpeed = 40;
  
  const walkDuration = Math.ceil((distance / walkSpeed) * 60);
  const transitDuration = Math.ceil((distance / transitSpeed) * 60) + 5;
  const taxiDuration = Math.ceil((distance / taxiSpeed) * 60) + 3;
  
  const taxiCost = Math.max(13, Math.round(distance * 2.5 + 10));
  
  return {
    distance,
    duration: transitDuration,
    walkDistance: distance,
    walkDuration,
    transitDuration,
    taxiDuration,
    taxiCost,
  };
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}分钟`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}米`;
  return `${km.toFixed(1)}公里`;
}