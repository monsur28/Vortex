"use client";
import React from 'react';
import { Download, AlertTriangle, ShieldCheck, Smartphone } from 'lucide-react';

export default function DownloadApp() {
  return (
    <div className="download-app-container" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', color: 'var(--text-primary)' }}>
      <div className="download-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <Smartphone size={64} color="var(--wc-green)" style={{ margin: '0 auto 16px' }} />
        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Get the World Cup App</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>Take your streaming experience on the go with our dedicated Android app.</p>
      </div>

      <div className="download-card" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '32px', textAlign: 'center', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>World Cup Player for Android</h2>
        
        <a 
          href="/Vortex.apk" 
          download 
          className="download-btn"
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '12px', 
            background: 'linear-gradient(135deg, var(--wc-green), #059669)', 
            color: '#022c22', 
            padding: '16px 32px', 
            borderRadius: 'var(--radius-md)', 
            textDecoration: 'none', 
            fontSize: '18px', 
            fontWeight: '800',
            boxShadow: '0 4px 15px rgba(0, 223, 137, 0.4)',
            transition: 'all 0.2s',
            marginBottom: '32px'
          }}
        >
          <Download size={24} />
          Download APK
        </a>

        <div className="install-warnings" style={{ textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24' }}>
            <AlertTriangle size={20} />
            Installation Instructions
          </h3>
          
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', color: 'var(--text-secondary)' }}>
              <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>1</span>
              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Enable Unknown Sources</strong>
                Go to your Android Settings &gt; Security (or Privacy) and enable "Install Unknown Apps" for your browser.
              </div>
            </li>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', color: 'var(--text-secondary)' }}>
              <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>2</span>
              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Click "Install Anyway"</strong>
                When prompted by Google Play Protect, click "More details" and select <strong>"Install anyway"</strong> to proceed.
              </div>
            </li>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', color: 'var(--text-secondary)' }}>
              <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>3</span>
              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldCheck size={16} color="var(--wc-green)" /> 100% Safe</strong>
                This app is secure and directly built from this website.
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
