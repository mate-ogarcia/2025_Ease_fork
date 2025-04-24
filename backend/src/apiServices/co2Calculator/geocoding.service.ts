import { Injectable } from "@nestjs/common";
import axios from "axios";

/**
 * @brief Interface for the distance result.
 * @param distance The distance in kilometers.
 * @param co2Impact The CO2 impact in kilograms.
 * @param transportType The transport type.
 */
interface DistanceResult {
  distance: number;
  co2Impact: number;
  transportType: string;
}

/**
 * @brief Service for geocoding and distance calculation.
 */
@Injectable()
export class GeocodingService {
  private readonly NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
  private readonly CACHE = new Map<string, { lat: number; lon: number }>();

  private readonly CO2_COEFFICIENTS = {
    plane: 0.55, // kg CO2 per km
    truck: 0.12, // kg CO2 per km
    ship: 0.017, // kg CO2 per km
  };

  /**
   * Converts a location name to coordinates (latitude, longitude)
   * @param location The location name (city, country, etc.)
   * @returns Promise with coordinates { lat, lon }
   */
  async getCoordinates(
    location: string
  ): Promise<{ lat: number; lon: number }> {
    // Input validation
    if (!location || typeof location !== 'string' || location.trim() === '') {
      throw new Error('Invalid location: location must be a non-empty string');
    }

    // Check cache first
    const cached = this.CACHE.get(location);
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(this.NOMINATIM_URL, {
        params: {
          q: location,
          format: "json",
          limit: 1,
        },
        headers: {
          "User-Agent": "YourAppName/1.0", // Required by Nominatim
        },
      });

      if (response.data && response.data.length > 0) {
        const result = {
          lat: parseFloat(response.data[0].lat),
          lon: parseFloat(response.data[0].lon),
        };
        // Cache the result
        this.CACHE.set(location, result);
        return result;
      }
      throw new Error(`Location not found: ${location}`);
    } catch (error) {
      console.error(`Error geocoding location ${location}:`, error);
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error(`Failed to geocode location: ${location}`);
    }
  }

  /**
   * Estimates the transport type based on distance and location
   * @param distance Distance in kilometers
   * @param origin Origin location name
   * @returns Estimated transport type
   */
  private estimateTransportType(distance: number, origin: string): string {
    // For very long distances (intercontinental)
    if (distance > 5000) {
      return 'plane';
    }
    // For medium distances or if origin is landlocked
    if (distance > 500 || !origin.toLowerCase().includes('sea') && !origin.toLowerCase().includes('ocean')) {
      return 'truck';
    }
    // For shorter distances or coastal locations
    return 'ship';
  }

  /**
   * Calculates the distance between two points and estimates CO2 impact
   * @param coords1 First point coordinates
   * @param coords2 Second point coordinates
   * @param origin Origin location name (for transport type estimation)
   * @returns Object containing distance, CO2 impact, and transport type
   */
  calculateDistance(
    coords1: { lat: number; lon: number },
    coords2: { lat: number; lon: number },
    origin: string
  ): DistanceResult {
    // Input validation
    if (!coords1 || !coords2) {
      throw new Error('Invalid coordinates: both points must be provided');
    }
    if (typeof coords1.lat !== 'number' || typeof coords1.lon !== 'number' ||
        typeof coords2.lat !== 'number' || typeof coords2.lon !== 'number') {
      throw new Error('Invalid coordinates: lat and lon must be numbers');
    }

    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(coords2.lat - coords1.lat);
    const dLon = this.toRad(coords2.lon - coords1.lon);
    const lat1 = this.toRad(coords1.lat);
    const lat2 = this.toRad(coords2.lat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Estimate transport type based on distance and origin
    const transportType = this.estimateTransportType(distance, origin);
    
    // Calculate CO2 impact
    const co2Impact = distance * this.CO2_COEFFICIENTS[transportType];

    return {
      distance,
      co2Impact,
      transportType
    };
  }

  /**
   * Converts degrees to radians.
   * @param degrees The angle in degrees.
   * @returns The angle in radians.
   */
  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
