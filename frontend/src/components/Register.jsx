import React, { useMemo, useRef, useState } from 'react';
import { UserRound, Mail, Phone, Mars, Droplet, LockKeyhole, Ruler, Weight, MapPin, Camera, Upload, Trash2, Eye, EyeOff, Heart, CalendarDays, ShieldCheck, Leaf, CheckCircle2, Home } from 'lucide-react';
import api from '../services/api';
import './Register.css';

const initialForm = { name: '', email: '', password: '', confirmPassword: '', phone_number: '', gender: '', blood_group: '', height: '', weight: '', address: '' };

function Field({ label, icon: Icon, children, required = false, className = '' }) {
    return <label className={`reg-field ${className}`}><span className="reg-label">{label}{required && <b> *</b>}</span><span className="reg-control">{Icon && <Icon size={18} strokeWidth={1.8} />}{children}</span></label>;
}

export default function Register({ onBackToLogin }) {
    const [form, setForm] = useState(initialForm);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [photo, setPhoto] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const fileRef = useRef(null);
    const update = (key, value) => setForm(old => ({ ...old, [key]: value }));
    const checks = useMemo(() => ({ length: form.password.length >= 8, upper: /[A-Z]/.test(form.password), number: /\d/.test(form.password), special: /[^A-Za-z0-9]/.test(form.password) }), [form.password]);
    const strength = Object.values(checks).filter(Boolean).length;

    function choosePhoto(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!['image/jpeg', 'image/png'].includes(file.type)) { setError('Please choose a JPG or PNG image.'); return; }
        if (file.size > 2 * 1024 * 1024) { setError('Profile photo must be smaller than 2 MB.'); return; }
        setError('');
        const reader = new FileReader();
        reader.onload = () => setPhoto(String(reader.result));
        reader.readAsDataURL(file);
    }

    async function submit(e) {
        e.preventDefault(); setError(''); setSuccess('');
        if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
        if (strength < 3) return setError('Choose a stronger password with at least 8 characters, an uppercase letter, a number and a special character.');
        if (form.phone_number && !/^\+?[0-9\s()-]{7,18}$/.test(form.phone_number)) return setError('Please enter a valid phone number.');
        setBusy(true);
        try {
            const { confirmPassword, ...payload } = form;
            const result = await api('/api/auth/register', { method: 'POST', body: JSON.stringify({ ...payload, name: payload.name.trim(), email: payload.email.trim().toLowerCase(), height: payload.height === '' ? '' : Number(payload.height), weight: payload.weight === '' ? '' : Number(payload.weight) }) });
            setSuccess(result.message || 'Patient account created successfully. You can now sign in.');
            setForm(initialForm); setPhoto('');
        } catch (err) { setError(err.message || 'Registration failed. Please try again.'); }
        finally { setBusy(false); }
    }

    return <main className="patient-register-page">
        <aside className="reg-brand-panel">
            <div className="reg-brand"><div className="reg-brand-mark"><span>✺</span></div><div><strong>AYURDHARA</strong><small>Panchakarma Care</small></div></div>
            <div className="reg-brand-divider"><i /><Leaf size={22} /><i /></div>
            <div className="reg-brand-copy"><span className="reg-kicker">BEGIN YOUR WELLNESS JOURNEY</span><h1>Care that is<br />thoughtfully<br />coordinated.<span className="reg-sparkle">✦</span></h1><p>Create your patient profile to keep your Panchakarma care, treatment schedule and progress together in one place.</p></div>
            <div className="reg-benefits"><div><span><Heart /></span>Personalized care &amp; tracking</div><div><span><CalendarDays /></span>Your treatment journey<br /> in one place</div><div><span><ShieldCheck /></span>Safe, secure and private</div></div>
            <img className="reg-hero-art" src="/ayurdhara-panchakarma-hero.png" alt="Traditional Ayurvedic wellness arrangement" />
            <div className="reg-panel-glow" />
        </aside>

        <section className="reg-main">
            <header className="reg-topbar"><div className="reg-breadcrumb"><Home size={20} /><span>AYURDHARA</span><b>/</b><strong>Create Patient Account</strong></div><div className="reg-signin-top">Already have an account? <button onClick={onBackToLogin}>Sign In</button></div></header>
            <div className="reg-form-scroll"><div className="reg-card">
                <div className="reg-card-heading"><div className="reg-heading-icon"><UserRound size={32} /><span>＋</span></div><div><h2>Create Your Patient Account</h2><p>Enter your details below. Fields marked <b>*</b> are required.</p></div><div className="reg-leaf-decoration">❧</div></div>
                <form onSubmit={submit}>
                    <div className="reg-photo-row"><div className="reg-avatar">{photo ? <img src={photo} alt="Profile preview" /> : <UserRound size={54} strokeWidth={1.1} />}<button type="button" aria-label="Upload profile photo" onClick={() => fileRef.current?.click()}><Camera size={17} /></button></div><div className="reg-photo-info"><strong>Profile Photo <em>(Optional)</em></strong><small>Upload a clear photo (JPG, PNG) · Max 2 MB</small><div className="reg-photo-actions"><button type="button" className="reg-upload" onClick={() => fileRef.current?.click()}><Upload size={17} /> Upload Photo</button>{photo && <button type="button" className="reg-remove" onClick={() => { setPhoto(''); if (fileRef.current) fileRef.current.value = ''; }}><Trash2 size={16} /> Remove</button>}</div><input ref={fileRef} hidden type="file" accept="image/png,image/jpeg" onChange={choosePhoto} /></div></div>

                    <div className="reg-section-bar"><UserRound /><span className="reg-number">01</span><strong>Personal Details</strong></div>
                    <div className="reg-fields personal-fields">
                        <Field label="Full Name" icon={UserRound} required className="span-two"><input required autoComplete="name" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Enter your full name" /></Field>
                        <Field label="Email Address" icon={Mail} required><input required type="email" autoComplete="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@example.com" /></Field>
                        <Field label="Phone Number" icon={Phone} required><input required type="tel" autoComplete="tel" value={form.phone_number} onChange={e => update('phone_number', e.target.value)} placeholder="Enter your phone number" /></Field>
                        <Field label={<>Gender <em>(Optional)</em></>} icon={Mars}><select value={form.gender} onChange={e => update('gender', e.target.value)}><option value="">Select gender</option><option>Female</option><option>Male</option><option>Other</option><option>Prefer not to say</option></select></Field>
                        <Field label={<>Blood Group <em>(Optional)</em></>} icon={Droplet}><select value={form.blood_group} onChange={e => update('blood_group', e.target.value)}><option value="">Select group</option>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(v => <option key={v}>{v}</option>)}</select></Field>
                    </div>

                    <div className="reg-section-bar"><LockKeyhole /><span className="reg-number">02</span><strong>Account Details</strong></div>
                    <div className="reg-fields">
                        <Field label="Password" icon={LockKeyhole} required><input required minLength={8} type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={e => update('password', e.target.value)} placeholder="At least 8 characters" /><button className="reg-eye" type="button" onClick={() => setShowPassword(v => !v)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></Field>
                        <Field label="Confirm Password" icon={LockKeyhole} required><input required minLength={8} type={showConfirm ? 'text' : 'password'} autoComplete="new-password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} placeholder="Re-enter your password" /><button className="reg-eye" type="button" onClick={() => setShowConfirm(v => !v)} aria-label="Toggle confirm password visibility">{showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}</button></Field>
                    </div>
                    <div className="reg-password-feedback"><div>Password strength: <b className={strength >= 3 ? 'strong' : strength === 2 ? 'medium' : 'weak'}>{!form.password ? '—' : strength >= 3 ? 'Strong' : strength === 2 ? 'Medium' : 'Weak'}</b><div className="reg-strength"><i className={strength >= 1 ? 'filled' : ''} /><i className={strength >= 2 ? 'filled' : ''} /><i className={strength >= 3 ? 'filled' : ''} /><i className={strength >= 4 ? 'filled' : ''} /></div></div><ul>{[['length', 'At least 8 characters'], ['upper', 'One uppercase letter'], ['number', 'One number'], ['special', 'One special character']].map(([key, label]) => <li className={checks[key] ? 'valid' : ''} key={key}><CheckCircle2 size={14} />{label}</li>)}</ul>{form.confirmPassword && <p className={form.password === form.confirmPassword ? 'match' : 'no-match'}>{form.password === form.confirmPassword ? '✓ Passwords match.' : 'Passwords do not match.'}</p>}</div>

                    <div className="reg-section-bar reg-health-bar"><Heart /><span className="reg-number">03</span><strong>Health &amp; Contact Details</strong><small>Optional — you can complete these later.</small></div>
                    <div className="reg-fields">
                        <Field label="Height (cm)" icon={Ruler}><input type="number" min="1" max="300" step="0.1" value={form.height} onChange={e => update('height', e.target.value)} placeholder="e.g. 165" /></Field>
                        <Field label="Weight (kg)" icon={Weight}><input type="number" min="1" max="500" step="0.1" value={form.weight} onChange={e => update('weight', e.target.value)} placeholder="e.g. 60" /></Field>
                        <Field label="Address" icon={MapPin} className="span-two"><input value={form.address} onChange={e => update('address', e.target.value)} placeholder="Enter your residential address" /></Field>
                    </div>
                    {error && <div className="reg-alert error" role="alert">{error}</div>}{success && <div className="reg-alert success" role="status">{success}</div>}
                    <button className="reg-submit" type="submit" disabled={busy}>{busy ? 'Creating Account…' : 'Create Patient Account'} <span>→</span></button>
                </form>
                <div className="reg-bottom-signin">Already have an account? <button type="button" onClick={onBackToLogin}>Sign In</button></div>
            </div></div>
        </section>
    </main>;
}
