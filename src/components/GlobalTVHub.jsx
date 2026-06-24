"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Globe, PlayCircle, Search, Tv } from 'lucide-react';

export default function GlobalTVHub({ isPlayerOpen, onWatchLive }) {
  const [channels, setChannels] = useState([]);
  const [streamsByChannel, setStreamsByChannel] = useState({});
  const [countries, setCountries] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('US');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch channels, streams, countries, and the working M3U playlist in parallel
        const [channelsRes, streamsRes, countriesRes, m3uRes] = await Promise.all([
          fetch('https://iptv-org.github.io/api/channels.json'),
          fetch('https://iptv-org.github.io/api/streams.json'),
          fetch('https://iptv-org.github.io/api/countries.json'),
          fetch('https://iptv-org.github.io/iptv/index.m3u')
        ]);

        if (!channelsRes.ok || !streamsRes.ok || !countriesRes.ok || !m3uRes.ok) {
          throw new Error('Failed to fetch IPTV data');
        }

        const channelsData = await channelsRes.json();
        const streamsData = await streamsRes.json();
        const countriesData = await countriesRes.json();
        const m3uText = await m3uRes.text();

        // Extract alive URLs from the working M3U playlist
        const aliveUrls = new Set(
          m3uText.split('\n')
            .filter(line => line.trim().startsWith('http'))
            .map(line => line.trim())
        );

        // Map countries by code
        const countryMap = {};
        countriesData.forEach(c => {
          countryMap[c.code] = c;
        });
        setCountries(countryMap);

        // Group streams by channel ID (only keeping working/alive ones)
        const streamsMap = {};
        streamsData.forEach(s => {
          if (!s.channel) return;
          if (!aliveUrls.has(s.url)) return; // Skip dead streams
          
          if (!streamsMap[s.channel]) streamsMap[s.channel] = [];
          streamsMap[s.channel].push(s);
        });
        setStreamsByChannel(streamsMap);

        // Filter only channels that have at least one stream ("alive")
        const aliveChannels = channelsData.filter(c => streamsMap[c.id] && streamsMap[c.id].length > 0);
        setChannels(aliveChannels);

      } catch (err) {
        console.error(err);
        setError('Could not load global TV channels. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Compute available countries based on alive channels
  const availableCountries = useMemo(() => {
    const counts = {};
    channels.forEach(c => {
      if (c.country) {
        counts[c.country] = (counts[c.country] || 0) + 1;
      }
    });
    
    return Object.keys(counts)
      .map(code => ({
        code,
        name: countries[code]?.name || code,
        flag: countries[code]?.flag || '🌍',
        count: counts[code]
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [channels, countries]);

  // Filter countries by search query
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return availableCountries;
    const lowerQ = searchQuery.toLowerCase();
    return availableCountries.filter(c => 
      c.name.toLowerCase().includes(lowerQ) || c.code.toLowerCase().includes(lowerQ)
    );
  }, [availableCountries, searchQuery]);

  // Get channels for the selected country
  const currentChannels = useMemo(() => {
    return channels
      .filter(c => c.country === selectedCountry)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [channels, selectedCountry]);

  const handleWatch = (channel) => {
    const stream = streamsByChannel[channel.id]?.[0];
    if (!stream) return;

    onWatchLive({
      id: channel.id,
      name: channel.name,
      logo: channel.logo || '',
      url: stream.url,
      group: countries[channel.country]?.name || 'Global TV',
      useProxy: true, // IPTV-org streams often need proxy for CORS/Mixed Content
      useNativeVideo: false
    });
  };

  return (
    <div id="global-tv-hub" className="world-cup-hub" style={{ display: 'block' }}>
      <div className="wc-header" style={{ background: 'linear-gradient(90deg, #1e3a8a, #0f172a)' }}>
        <div className="wc-title-area">
          <span className="wc-logo-badge" style={{ background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#60a5fa' }}>
            <Globe size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> 
            IPTV ORG
          </span>
          <h2 style={{ color: 'white' }}>GLOBAL TV HUB</h2>
        </div>
        <div className="wc-countdown" style={{ borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
          <span className="countdown-label" style={{ color: '#60a5fa' }}>LIVE CHANNELS</span>
          <div className="countdown-timer" style={{ fontSize: '24px', color: 'white' }}>
            {loading ? '...' : channels.length.toLocaleString()}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          <p>Loading thousands of global channels...</p>
        </div>
      ) : error ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
          <p>{error}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px' }}>
          
          {/* Country Selection */}
          <div style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  placeholder="Search countries..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white', fontSize: '13px' }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'thin' }} className="sportzify-scrollbar">
              {filteredCountries.map(country => (
                <button
                  key={country.code}
                  onClick={() => setSelectedCountry(country.code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '24px',
                    border: '1px solid',
                    borderColor: selectedCountry === country.code ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                    background: selectedCountry === country.code ? 'rgba(59, 130, 246, 0.2)' : 'rgba(0,0,0,0.3)',
                    color: selectedCountry === country.code ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                    fontWeight: selectedCountry === country.code ? '600' : '400'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{country.flag}</span>
                  <span style={{ fontSize: '12px' }}>{country.name}</span>
                  <span style={{ fontSize: '10px', opacity: 0.6, background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '10px' }}>{country.count}</span>
                </button>
              ))}
              {filteredCountries.length === 0 && (
                <span style={{ color: 'var(--text-secondary)', fontSize: '12px', padding: '8px' }}>No countries found.</span>
              )}
            </div>
          </div>

          {/* Channels Grid */}
          <div>
            <h3 style={{ fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
              <Tv size={18} color="#3b82f6" />
              {countries[selectedCountry]?.name || selectedCountry} Channels
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {currentChannels.map(channel => (
                <div key={channel.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s' }} className="hover-highlight">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <div style={{ width: '40px', height: '40px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {channel.logo ? (
                        <img src={channel.logo} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <Tv size={20} color="var(--text-secondary)" opacity={0.5} />
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: '600', fontSize: '13px', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {channel.name}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {channel.categories?.map(cat => (
                          <span key={cat} style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{cat}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleWatch(channel)}
                    style={{ 
                      background: 'rgba(59, 130, 246, 0.1)', 
                      color: '#60a5fa', 
                      border: '1px solid rgba(59, 130, 246, 0.3)', 
                      borderRadius: '6px', 
                      padding: '8px 12px', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '11px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'; }}
                  >
                    <PlayCircle size={14} />
                    Watch
                  </button>
                </div>
              ))}
              {currentChannels.length === 0 && (
                <div style={{ gridColumn: '1 / -1', padding: '30px', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  No active channels available for this country.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .hover-highlight:hover {
          background: rgba(255,255,255,0.06) !important;
        }
      `}} />
    </div>
  );
}
