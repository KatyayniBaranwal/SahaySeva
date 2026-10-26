import { useState } from 'react';
import client from '../api/client';
import Badge from '../components/Badge';
import { format_date } from '../utils/constants';

const CertificateVerify = () => {
  const [certificateId, setCertificateId] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const verify = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const res = await client.get(`/certificates/verify/${encodeURIComponent(certificateId.trim())}`);
      setResult(res.data);
    } catch (err) {
      if (err.status === 404) setResult({ valid: false, message: err.message });
      else setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container page page-narrow">
      <div className="page-head">
        <div>
          <h1>Certificate Verification</h1>
          <p className="page-sub">
            Enter a Certificate ID (e.g. <code>SS-2026-0001</code>) to verify a community-service
            certificate issued through SahaySeva.
          </p>
        </div>
      </div>

      <form onSubmit={verify} className="card verify-form">
        <div className="field">
          <label htmlFor="certId">Certificate ID</label>
          <input
            id="certId"
            required
            value={certificateId}
            onChange={(e) => setCertificateId(e.target.value)}
            placeholder="SS-2026-0001"
            className="cert-input"
          />
        </div>
        <button className="btn btn-primary btn-lg" disabled={busy}>
          {busy ? 'Verifying…' : '🔍 Verify Certificate'}
        </button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {result && !result.valid && (
        <div className="card verify-result invalid">
          <div className="verify-verdict">❌ INVALID / NOT FOUND</div>
          <p>{result.message || 'This certificate could not be verified.'}</p>
        </div>
      )}

      {result && result.valid && result.certificate && (
        <div className="card verify-result valid">
          <div className="verify-verdict">✅ VALID CERTIFICATE</div>
          <div className="cert-display">
            <div className="cert-display-inner">
              <span className="cert-label">CERTIFICATE OF COMMUNITY SERVICE</span>
              <h2>{result.certificate.recipientName}</h2>
              <p className="cert-line">
                has successfully completed <strong>{result.certificate.activityName}</strong>
              </p>
              <p className="cert-line">
                with <strong>{result.certificate.serviceHours} verified service hours</strong>
              </p>
              <div className="cert-row">
                <span>Issued by <strong>{result.certificate.issuer}</strong></span>
                <span>Completed on <strong>{format_date(result.certificate.completionDate)}</strong></span>
              </div>
              <div className="cert-row">
                <span>Certificate ID <strong>{result.certificate.certificateId}</strong></span>
                <Badge type="verified">✓ VERIFIED</Badge>
              </div>
              {result.certificate.verificationData?.verifiedUrl && (
                <div className="cert-qr">
                  QR-ready verification URL:{' '}
                  <code>
                    {result.certificate.verificationData.verifiedUrl}?id={result.certificate.certificateId}
                  </code>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="card demo-hint">
        💡 <strong>Demo tip:</strong> try <code>SS-2026-0001</code>, <code>SS-2026-0002</code> or{' '}
        <code>SS-2026-0003</code> from the seeded demo data.
      </div>
    </div>
  );
};

export default CertificateVerify;
