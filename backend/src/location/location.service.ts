import { Injectable } from '@nestjs/common';
import { getDistance } from 'geolib';

export interface Location {
  latitude: number;
  longitude: number;
}

export interface DeliveryPersonWithLocation {
  _id: string;
  latitude: number;
  longitude: number;
  averageRating: number;
  [key: string]: any;
}

@Injectable()
export class LocationService {
  /**
   * Calculate distance between two coordinates in kilometers
   */
  calculateDistance(
    point1: Location,
    point2: Location,
  ): number {
    const distanceInMeters = getDistance(
      { latitude: point1.latitude, longitude: point1.longitude },
      { latitude: point2.latitude, longitude: point2.longitude },
    );
    return distanceInMeters / 1000; // Convert to km
  }

  /**
   * Find delivery persons within a radius (in km)
   */
  findWithinRadius(
    center: Location,
    deliveryPersons: DeliveryPersonWithLocation[],
    radiusKm: number = 5,
  ): (DeliveryPersonWithLocation & { distance: number })[] {
    return deliveryPersons
      .filter((dp) => dp.latitude && dp.longitude)
      .map((dp) => ({
        ...dp,
        distance: this.calculateDistance(center, {
          latitude: dp.latitude,
          longitude: dp.longitude,
        }),
      }))
      .filter((dp) => dp.distance <= radiusKm) as (DeliveryPersonWithLocation & { distance: number })[];
  }

  /**
   * Sort delivery persons by distance and rating
   */
  sortByDistanceAndRating(
    deliveryPersons: (DeliveryPersonWithLocation & { distance: number })[],
  ): (DeliveryPersonWithLocation & { distance: number })[] {
    return deliveryPersons.sort((a, b) => {
      // First sort by distance
      if (a.distance !== b.distance) {
        return a.distance - b.distance;
      }
      // Then by rating (higher is better)
      return b.averageRating - a.averageRating;
    });
  }

  /**
   * Find nearby delivery persons within radius, sorted by distance and rating
   */
  findNearbyDeliveryPersons(
    center: Location,
    deliveryPersons: DeliveryPersonWithLocation[],
    radiusKm: number = 5,
  ): (DeliveryPersonWithLocation & { distance: number })[] {
    const withinRadius = this.findWithinRadius(center, deliveryPersons, radiusKm);
    return this.sortByDistanceAndRating(withinRadius);
  }
}
