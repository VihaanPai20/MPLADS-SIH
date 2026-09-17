import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGeographicAnalytics, useRiskAnalysis } from '../hooks/useData';
import { Map as MapIcon, ChevronRight, Loader2, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons if needed, though we are using GeoJSON polygons
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapController({ geojson }: { geojson: any }) {
  const map = useMap();
  useEffect(() => {
    if (geojson) {
      // Very basic bounds setting, or just leave default
      map.setView([22.5937, 78.9629], 4);
    }
  }, [geojson, map]);
  return null;
}

export function Geographic() {
  const navigate = useNavigate();
  const { analytics, loading: geoLoading } = useGeographicAnalytics();
  const { riskData, loading: riskLoading } = useRiskAnalysis();
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [mapMetric, setMapMetric] = useState<'allocation' | 'risk' | 'members'>('allocation');

  useEffect(() => {
    fetch('/india_states.geojson')
      .then(res => res.json())
      .then(data => setGeojsonData(data))
      .catch(err => console.error("Error loading geojson", err));
  }, []);

  const enrichedAnalytics = useMemo(() => {
    if (!analytics || !riskData) return analytics || [];
    
    return analytics.map(a => {
      const stateRisks = riskData.results.filter((r: any) => {
        const member = riskData.members.find((m: any) => m.id === r.memberId);
        return member?.state === a.state;
      });
      const riskSignals = stateRisks.length;
      return {
        ...a,
        riskSignals
      };
    });
  }, [analytics, riskData]);

  const maxValues = useMemo(() => {
    if (!enrichedAnalytics.length) return { allocation: 1, risk: 1, members: 1 };
    return {
      allocation: Math.max(...enrichedAnalytics.map(a => a.allocation)),
      risk: Math.max(...enrichedAnalytics.map(a => a.riskSignals)),
      members: Math.max(...enrichedAnalytics.map(a => a.membersCount))
    };
  }, [enrichedAnalytics]);

  const topKPIs = useMemo(() => {
    if (!enrichedAnalytics.length) return null;
    
    const sortedByAlloc = [...enrichedAnalytics].sort((a, b) => b.allocation - a.allocation);
    const sortedByRisk = [...enrichedAnalytics].sort((a, b) => b.riskSignals - a.riskSignals);
    
    return {
      statesCovered: enrichedAnalytics.length,
      highestRisk: sortedByRisk[0],
      highestAlloc: sortedByAlloc[0],
      totalAlloc: enrichedAnalytics.reduce((sum, a) => sum + a.allocation, 0)
    };
  }, [enrichedAnalytics]);

  const getFeatureStyle = (feature: any) => {
    // Determine state name from GeoJSON properties
    const stateName = feature.properties.st_nm || feature.properties.ST_NM || feature.properties.NAME_1 || feature.properties.name;
    const stateData = enrichedAnalytics.find(a => a.state.toLowerCase().replace(/&/g,'and') === stateName?.toLowerCase().replace(/&/g,'and'));
    
    if (!stateData) {
      return { fillColor: '#D8D5CB', weight: 1, opacity: 1, color: 'white', fillOpacity: 0.4 };
    }

    let intensity = 0;
    let colorBase = '37, 99, 235'; // blue

    if (mapMetric === 'allocation') {
      intensity = stateData.allocation / maxValues.allocation;
      colorBase = '37, 99, 235'; // blue
    } else if (mapMetric === 'risk') {
      intensity = stateData.riskSignals / maxValues.risk;
      colorBase = '220, 38, 38'; // red
    } else if (mapMetric === 'members') {
      intensity = stateData.membersCount / maxValues.members;
      colorBase = '16, 185, 129'; // green
    }

    // Ensure minimum visible opacity for states with data
    const fillOpacity = Math.max(0.2, intensity * 0.8);
    
    return {
      fillColor: `rgba(${colorBase}, ${fillOpacity})`,
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const stateName = feature.properties.st_nm || feature.properties.ST_NM || feature.properties.NAME_1 || feature.properties.name;
    const stateData = enrichedAnalytics.find(a => a.state.toLowerCase().replace(/&/g,'and') === stateName?.toLowerCase().replace(/&/g,'and'));
    
    if (stateData) {
      layer.bindTooltip(`
        <div class="font-bold text-charcoal">${stateData.state}</div>
        <div class="text-xs text-secondaryText mt-1">
          <div>Members: ${stateData.membersCount}</div>
          <div>Allocation: ₹${(stateData.allocation / 10000000).toFixed(2)} Cr</div>
          <div>Risk Signals: ${stateData.riskSignals}</div>
        </div>
      `, { sticky: true });
    } else {
       layer.bindTooltip(`<div class="font-bold text-charcoal">${stateName || 'Unknown'}</div><div class="text-xs text-mutedText">No data</div>`, { sticky: true });
    }

    layer.on({
      click: () => {
        if (stateData) setSelectedState(stateData.state);
      },
      mouseover: (e: any) => {
        const l = e.target;
        l.setStyle({ weight: 2, color: '#333', fillOpacity: 0.9 });
      },
      mouseout: (e: any) => {
        const l = e.target;
        l.setStyle(getFeatureStyle(feature));
      }
    });
  };

  if (geoLoading || riskLoading) return <div className="p-8 text-mutedText flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Loading geographic analytics...</div>;

  const selectedStateData = selectedState ? enrichedAnalytics.find(a => a.state === selectedState) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Geographic Intelligence</h1>
        <p className="text-mutedText mt-1 text-sm">
          Interactive state-level intelligence mapping for risk and financial allocation.
        </p>
      </div>

      {topKPIs && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-brandBorder shadow-sm">
            <div className="text-[10px] font-bold text-mutedText uppercase tracking-wider mb-1">States Covered</div>
            <div className="text-xl font-bold text-charcoal">{topKPIs.statesCovered}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-brandBorder shadow-sm">
            <div className="text-[10px] font-bold text-mutedText uppercase tracking-wider mb-1">Total Allocation</div>
            <div className="text-xl font-bold text-charcoal">₹{(topKPIs.totalAlloc / 10000000).toFixed(0)} Cr</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-brandBorder shadow-sm border-l-4 border-l-blue-500">
            <div className="text-[10px] font-bold text-mutedText uppercase tracking-wider mb-1">Highest Allocation</div>
            <div className="text-lg font-bold text-forest-deep truncate">{topKPIs.highestAlloc.state}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-brandBorder shadow-sm border-l-4 border-l-red-500">
            <div className="text-[10px] font-bold text-mutedText uppercase tracking-wider mb-1">Highest Risk Concentration</div>
            <div className="text-lg font-bold text-red-600 truncate">{topKPIs.highestRisk.state}</div>
          </div>
        </div>
      )}

      {/* Main Geographic Interface */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Map Section */}
        <div className="w-full lg:w-2/3 bg-white border border-brandBorder rounded-lg shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-brandBorder bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="font-bold text-charcoal flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-mutedText" />
              India Geographic Map
            </h2>
            <div className="flex bg-white border border-brandBorder rounded-md p-1 shadow-sm text-sm">
              <button 
                onClick={() => setMapMetric('allocation')}
                className={`px-3 py-1.5 rounded-sm font-medium transition-colors ${mapMetric === 'allocation' ? 'bg-palegreen text-forest-deep' : 'text-mutedText hover:bg-white'}`}
              >
                Allocation
              </button>
              <button 
                onClick={() => setMapMetric('risk')}
                className={`px-3 py-1.5 rounded-sm font-medium transition-colors ${mapMetric === 'risk' ? 'bg-red-100 text-red-700' : 'text-mutedText hover:bg-white'}`}
              >
                Risk Signals
              </button>
              <button 
                onClick={() => setMapMetric('members')}
                className={`px-3 py-1.5 rounded-sm font-medium transition-colors ${mapMetric === 'members' ? 'bg-palegreen text-forest-deep' : 'text-mutedText hover:bg-white'}`}
              >
                Members
              </button>
            </div>
          </div>
          
          <div className="relative h-[500px] bg-sky-50/30">
            {geojsonData ? (
              <MapContainer 
                center={[22.5937, 78.9629]} 
                zoom={4} 
                style={{ height: '100%', width: '100%', background: 'transparent' }}
                zoomControl={false}
                scrollWheelZoom={false}
              >
                <MapController geojson={geojsonData} />
                <GeoJSON 
                  data={geojsonData} 
                  style={getFeatureStyle}
                  onEachFeature={onEachFeature}
                />
              </MapContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-mutedText">
                <Loader2 className="w-8 h-8 animate-spin mb-3 text-mutedText" />
                <p>Loading Geographic Bounds...</p>
              </div>
            )}

            {/* Legend Overlay */}
            <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded-md shadow-sm border border-brandBorder text-xs backdrop-blur-sm z-[1000]">
              <div className="font-bold text-charcoal mb-2 capitalize">{mapMetric} Intensity</div>
              <div className="flex items-center gap-2">
                <span className="text-mutedText">Low</span>
                <div className={`w-24 h-3 rounded-full bg-gradient-to-r ${
                  mapMetric === 'allocation' ? 'from-blue-100 to-blue-700' : 
                  mapMetric === 'risk' ? 'from-red-100 to-red-700' : 
                  'from-emerald-100 to-emerald-700'
                }`}></div>
                <span className="text-mutedText">High</span>
              </div>
            </div>
          </div>
        </div>

        {/* Intelligence Side Panel */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          {selectedStateData ? (
            <div className="bg-white border border-brandBorder rounded-lg shadow-sm flex flex-col">
              <div className="p-4 border-b border-brandBorder bg-white">
                <div className="flex justify-between items-center mb-1">
                  <h2 className="font-bold text-lg text-charcoal">{selectedStateData.state}</h2>
                  <button onClick={() => setSelectedState(null)} className="text-xs text-forest-primary hover:underline">Clear</button>
                </div>
                <p className="text-xs text-mutedText uppercase tracking-wider font-bold">State Intelligence Profile</p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <div className="text-sm text-mutedText">Total Allocation</div>
                    <div className="text-xl font-bold text-charcoal">₹{(selectedStateData.allocation / 10000000).toFixed(2)} Cr</div>
                  </div>
                  <div className="w-full bg-palegreen h-2 rounded-full overflow-hidden">
                    <div className="bg-forest-primary h-full" style={{width: `${(selectedStateData.allocation / maxValues.allocation) * 100}%`}}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-1">
                    <div className="text-sm text-mutedText">Risk Signals</div>
                    <div className="text-xl font-bold text-red-600">{selectedStateData.riskSignals}</div>
                  </div>
                  <div className="w-full bg-palegreen h-2 rounded-full overflow-hidden">
                    <div className="bg-risk-critical h-full" style={{width: `${(selectedStateData.riskSignals / maxValues.risk) * 100}%`}}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-1">
                    <div className="text-sm text-mutedText">Members of Parliament</div>
                    <div className="text-xl font-bold text-forest-primary">{selectedStateData.membersCount}</div>
                  </div>
                  <div className="w-full bg-palegreen h-2 rounded-full overflow-hidden">
                    <div className="bg-forest-primary h-full" style={{width: `${(selectedStateData.membersCount / maxValues.members) * 100}%`}}></div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-brandBorder">
                  <button onClick={() => navigate('/dashboard/districts')} className="w-full py-2 bg-white hover:bg-palegreen text-forest-primary text-sm font-semibold rounded-md border border-brandBorder transition-colors flex items-center justify-center gap-1">
                    View District Analytics <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-brandBorder border-dashed rounded-lg shadow-sm flex flex-col items-center justify-center p-8 text-center h-full min-h-[300px]">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-mutedText mb-4 shadow-sm">
                <MapIcon className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-charcoal mb-1">Select a State</h3>
              <p className="text-sm text-mutedText">
                Click on any state in the map to view detailed geographic intelligence, risk distributions, and financial metrics.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* State Ranking Chart */}
      <div className="bg-white border border-brandBorder rounded-lg shadow-sm p-4">
        <h2 className="font-bold text-charcoal mb-4 flex items-center gap-2 text-sm">
          <BarChart2 className="w-4 h-4 text-mutedText" />
          State Allocation Comparison
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={enrichedAnalytics.slice(0, 15)} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D8D5CB" />
              <XAxis dataKey="state" tick={{fontSize: 10}} interval={0} angle={-45} textAnchor="end" height={60} />
              <YAxis tickFormatter={(v) => `₹${(v / 10000000).toFixed(0)}Cr`} tick={{fontSize: 11}} width={80} />
              <Tooltip 
                formatter={(value: any) => [`₹${(Number(value) / 10000000).toFixed(2)} Cr`, 'Allocation']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="allocation" fill="#356B52" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
