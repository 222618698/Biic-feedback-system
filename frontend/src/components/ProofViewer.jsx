// frontend/src/components/ProofViewer.jsx
//
// Drop this into your submission detail modal wherever proof files are listed.
//
// Usage:
//   import ProofViewer from '../components/ProofViewer';
//   <ProofViewer proofs={submission.proofs} />
//
// Each proof object should have: { name, mimetype, url }
//   - url  : either a full URL (e.g. from S3/backend) OR a base64 data string
//   - mimetype : e.g. "application/pdf", "image/jpeg", etc.

import React, { useState } from 'react';

/* ── PDF viewer modal ── */
function PdfModal({ src, name, onClose }) {
  // src may be a base64 data-URL or a remote URL
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(10,30,61,.85)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: 12, overflow: 'hidden',
          width: '100%', maxWidth: 860, maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 8px 48px rgba(10,30,61,.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: 'var(--navy, #0a1e3d)',
          padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ color: '#fff', fontSize: 14, fontWeight: 500, maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            📄 {name}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {/* Download button */}
            <a
              href={src}
              download={name}
              style={{
                background: 'var(--gold, #c9a441)', color: 'var(--navy, #0a1e3d)',
                border: 'none', borderRadius: 7, padding: '6px 14px',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download
            </a>
            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,.12)', border: 'none', borderRadius: 7,
                color: '#fff', width: 32, height: 32, cursor: 'pointer', fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >×</button>
          </div>
        </div>

        {/* PDF iframe */}
        <div style={{ flex: 1, overflow: 'hidden', minHeight: 400 }}>
          <iframe
            src={src}
            title={name}
            style={{ width: '100%', height: '100%', minHeight: 500, border: 'none' }}
          />
        </div>

        {/* Fallback strip — shown if iframe is blank (e.g. browser blocks base64 PDFs) */}
        <div style={{
          background: '#fef9ec', borderTop: '1px solid rgba(201,164,65,.3)',
          padding: '10px 20px', fontSize: 12, color: '#7b5e00',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          If the PDF doesn't display, use the <strong style={{ margin: '0 4px' }}>Download</strong> button above to open it.
        </div>
      </div>
    </div>
  );
}

/* ── Image lightbox ── */
function ImageLightbox({ src, name, onClose }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,.88)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
    >
      <img
        src={src}
        alt={name}
        style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: 8, objectFit: 'contain' }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

/* ── Main ProofViewer ── */
export default function ProofViewer({ proofs }) {
  const [pdfOpen,   setPdfOpen]   = useState(null); // { src, name }
  const [imgOpen,   setImgOpen]   = useState(null); // { src, name }

  if (!proofs || proofs.length === 0) {
    return <span style={{ fontSize: 12, color: 'var(--text-light, #607088)' }}>No attachments</span>;
  }

  const getUrl = (proof) => {
    // Prefer a remote URL if present; fall back to base64 data
    return proof.url || proof.data || '';
  };

  const getMime = (proof) => {
    return proof.mimetype || proof.type || '';
  };

  const isImage = (proof) => getMime(proof).startsWith('image/');
  const isPdf   = (proof) => getMime(proof) === 'application/pdf';

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
        {proofs.map((proof, i) => {
          const src  = getUrl(proof);
          const name = proof.name || `attachment-${i + 1}`;

          if (isImage(proof)) {
            return (
              <div
                key={i}
                onClick={() => setImgOpen({ src, name })}
                style={{
                  width: 80, height: 80, borderRadius: 8, overflow: 'hidden',
                  border: '1px solid var(--cream-mid, #cfc0a0)',
                  cursor: 'zoom-in', flexShrink: 0,
                }}
              >
                <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            );
          }

          if (isPdf(proof)) {
            return (
              <div
                key={i}
                onClick={() => setPdfOpen({ src, name })}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 6, width: 80, height: 80, borderRadius: 8,
                  background: 'var(--cream, #f5f0e4)',
                  border: '1px solid var(--cream-mid, #cfc0a0)',
                  cursor: 'pointer', flexShrink: 0, padding: 8,
                  transition: 'border-color .2s, background .2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--gold, #c9a441)'; e.currentTarget.style.background = '#fdf9f0'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--cream-mid, #cfc0a0)'; e.currentTarget.style.background = 'var(--cream, #f5f0e4)'; }}
                title={`View PDF: ${name}`}
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="var(--gold-dim, #9a7c2e)" strokeWidth={1.8} width={28} height={28}>
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="9" y1="13" x2="15" y2="13"/>
                  <line x1="9" y1="17" x2="15" y2="17"/>
                </svg>
                <span style={{
                  fontSize: 9, color: 'var(--text-muted, #3d4f6e)',
                  textAlign: 'center', wordBreak: 'break-all', lineHeight: 1.2,
                }}>
                  {name.length > 14 ? name.slice(0, 12) + '…' : name}
                </span>
              </div>
            );
          }

          // Generic document (Word, Excel, etc.)
          return (
            <a
              key={i}
              href={src}
              download={name}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 6, width: 80, height: 80, borderRadius: 8,
                background: 'var(--cream, #f5f0e4)',
                border: '1px solid var(--cream-mid, #cfc0a0)',
                cursor: 'pointer', flexShrink: 0, padding: 8,
                textDecoration: 'none',
              }}
              title={`Download: ${name}`}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="var(--gold-dim, #9a7c2e)" strokeWidth={1.8} width={28} height={28}>
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span style={{
                fontSize: 9, color: 'var(--text-muted, #3d4f6e)',
                textAlign: 'center', wordBreak: 'break-all', lineHeight: 1.2,
              }}>
                {name.length > 14 ? name.slice(0, 12) + '…' : name}
              </span>
            </a>
          );
        })}
      </div>

      {/* Modals */}
      {pdfOpen && <PdfModal src={pdfOpen.src} name={pdfOpen.name} onClose={() => setPdfOpen(null)} />}
      {imgOpen && <ImageLightbox src={imgOpen.src} name={imgOpen.name} onClose={() => setImgOpen(null)} />}
    </>
  );
}