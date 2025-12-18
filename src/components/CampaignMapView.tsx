import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface SchoolRecommendation {
  id: string;
  response_status: string;
  generated_data: {
    institution_name: string;
    province: string;
    district: string;
    longitude?: number;
    latitude?: number;
    learners_2024?: number;
    quintile?: string;
  };
  campaign_id: string;
}

interface CampaignMapViewProps {
  recommendations: SchoolRecommendation[];
  onSchoolClick?: (schoolId: string) => void;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'confirmed': return '#22c55e'; // green
    case 'declined': return '#ef4444'; // red
    case 'pending': return '#3b82f6'; // blue
    default: return '#9ca3af'; // gray
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'confirmed': return 'Confirmed';
    case 'declined': return 'Declined';
    case 'pending': return 'Pending';
    default: return status;
  }
};

const CampaignMapView = ({ recommendations, onSchoolClick }: CampaignMapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [tokenEntered, setTokenEntered] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || !tokenEntered || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    // Filter schools with valid coordinates
    const schoolsWithCoords = recommendations.filter(
      r => r.generated_data?.longitude && r.generated_data?.latitude
    );

    if (schoolsWithCoords.length === 0) {
      return;
    }

    // Calculate bounds for all schools
    const bounds = new mapboxgl.LngLatBounds();
    schoolsWithCoords.forEach(rec => {
      bounds.extend([rec.generated_data.longitude!, rec.generated_data.latitude!]);
    });

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      bounds: bounds,
      fitBoundsOptions: { padding: 50 }
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add markers for each school
    schoolsWithCoords.forEach(rec => {
      const { generated_data, response_status, id } = rec;
      const color = getStatusColor(response_status);
      
      const statusBadge = `
        <span style="
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 500;
          background-color: ${color}20;
          color: ${color};
        ">
          ${getStatusLabel(response_status)}
        </span>
      `;

      const popup = new mapboxgl.Popup({ offset: 25, maxWidth: '280px' }).setHTML(`
        <div style="padding: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
            <h3 style="font-weight: 600; margin: 0; font-size: 14px; line-height: 1.3; max-width: 180px;">
              ${generated_data.institution_name}
            </h3>
            ${statusBadge}
          </div>
          <p style="font-size: 12px; color: #6b7280; margin: 0 0 4px 0;">
            ${generated_data.district}, ${generated_data.province}
          </p>
          ${generated_data.learners_2024 ? `
            <p style="font-size: 12px; color: #6b7280; margin: 0 0 4px 0;">
              Learners: ${generated_data.learners_2024.toLocaleString()}
            </p>
          ` : ''}
          ${generated_data.quintile ? `
            <p style="font-size: 12px; color: #6b7280; margin: 0;">
              Quintile: ${generated_data.quintile}
            </p>
          ` : ''}
        </div>
      `);

      const marker = new mapboxgl.Marker({ color })
        .setLngLat([generated_data.longitude!, generated_data.latitude!])
        .setPopup(popup)
        .addTo(map.current!);

      if (onSchoolClick) {
        marker.getElement().addEventListener('click', () => {
          onSchoolClick(id);
        });
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [recommendations, tokenEntered, mapboxToken, onSchoolClick]);

  // Calculate stats
  const stats = {
    confirmed: recommendations.filter(r => r.response_status === 'confirmed').length,
    pending: recommendations.filter(r => r.response_status === 'pending').length,
    declined: recommendations.filter(r => r.response_status === 'declined').length,
    total: recommendations.length,
  };

  if (!tokenEntered) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Map Configuration</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Enter your Mapbox public token to view schools on the map. Get your token at{' '}
            <a 
              href="https://mapbox.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:underline"
            >
              mapbox.com
            </a>
          </p>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="pk.eyJ1Ijoi..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
            <Button onClick={() => setTokenEntered(true)} disabled={!mapboxToken}>
              Load Map
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <Card>
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Status Legend:</span>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground">Confirmed ({stats.confirmed})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-muted-foreground">Pending ({stats.pending})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-muted-foreground">Declined ({stats.declined})</span>
              </div>
            </div>
            <Badge variant="secondary">{stats.total} schools total</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <div className="relative w-full h-[500px] rounded-lg overflow-hidden border">
        <div ref={mapContainer} className="absolute inset-0" />
      </div>
    </div>
  );
};

export default CampaignMapView;
