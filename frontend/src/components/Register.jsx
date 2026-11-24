
import React, { useMemo, useRef, useState } from 'react';
import {
    UserRound, Mail, Phone, Mars, Droplet, LockKeyhole,
    Ruler, Weight, MapPin, Camera, Upload, Trash2,
    Eye, EyeOff, Heart, CalendarDays, ShieldCheck,
    Leaf, CheckCircle2, Home, Sparkles, Plus, ArrowRight, Check
} from 'lucide-react';

import {
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
    signOut
} from 'firebase/auth';

import { auth } from '../firebase';
import api from '../services/api';
import AyurDharaLogo from './AyurDharaLogo';

const initialForm = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone_number: '',
    gender: '',
    blood_group: '',
    height: '',
    weight: '',
    address: ''
};

function Field({ label, icon: Icon, children, required = false, className = '' }) {
    return (
        <label className={`flex flex-col gap-[7px] min-w-0 ${className}`}>
            <span className="text-[13px] font-bold text-[#15231c]">
                {label}
                {required && <b className="text-[#df2626]"> *</b>}
            </span>

            <span className="h-[39px] max-[1500px]:h-[42px] border border-[#b9c5d0] rounded-[10px] bg-white flex items-center gap-[10px] px-[12px] text-[#08703b] shadow-[0_1px_2px_#173c2510] min-w-0 focus-within:border-[#6da84c] focus-within:ring-3 focus-within:ring-[#8cbd63]/30">

                {Icon && <Icon size={18} strokeWidth={1.8} className="shrink-0" />}
                {children}
            </span>
        </label>
    );
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

    const update = (key, value) =>
        setForm(old => ({ ...old, [key]: value }));

    const checks = useMemo(() => ({
        length: form.password.length >= 8,
        upper: /[A-Z]/.test(form.password),
        number: /\d/.test(form.password),
        special: /[^A-Za-z0-9]/.test(form.password)
    }), [form.password]);

    const strength = Object.values(checks).filter(Boolean).length;

    function choosePhoto(e) {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            setError('Please choose a JPG or PNG image.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setError('Profile photo must be smaller than 2 MB.');
            return;
        }

        setError('');

        const reader = new FileReader();

        reader.onload = () => setPhoto(String(reader.result));
        reader.readAsDataURL(file);
    }

    // FIREBASE PATIENT REGISTRATION
    async function submit(e) {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (form.password !== form.confirmPassword) {
            return setError('Passwords do not match.');
        }

        if (strength < 3) {
            return setError(
                'Choose a stronger password with at least 8 characters, an uppercase letter, a number and a special character.'
            );
        }

        if (
            form.phone_number &&
            !/^\+?[0-9\s()-]{7,18}$/.test(form.phone_number)
        ) {
            return setError('Please enter a valid phone number.');
        }

        setBusy(true);

        let firebaseUserCreated = false;

        try {
            const name = form.name.trim();
            const email = form.email.trim().toLowerCase();

            // 1. Create Firebase account
            const credential = await createUserWithEmailAndPassword(
                auth,
                email,
                form.password
            );

            const firebaseUser = credential.user;
            firebaseUserCreated = true;

            // 2. Set Firebase user's display name
            await updateProfile(firebaseUser, {
                displayName: name
            });

            // 3. Send email verification link
            await sendEmailVerification(firebaseUser);

            // 4. Get Firebase ID token
            const idToken = await firebaseUser.getIdToken();

            // 5. Prepare patient details for backend
            const payload = {
                idToken,
                name,
                email,
                phone_number: form.phone_number.trim(),
                gender: form.gender,
                blood_group: form.blood_group,
                height: form.height === '' ? '' : Number(form.height),
                weight: form.weight === '' ? '' : Number(form.weight),
                address: form.address.trim(),
                profile_photo: photo || null
            };

            // 6. Save patient profile in PostgreSQL through backend
            const result = await api('/api/auth/firebase/register', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            // 7. Sign out until the email is verified
            await signOut(auth);

            setSuccess(
                result.message ||
                'Your patient account has been created. Please check your email and verify your email address before signing in.'
            );

            setForm(initialForm);
            setPhoto('');

            if (fileRef.current) {
                fileRef.current.value = '';
            }

        } catch (err) {
            console.error('Registration error:', err);

            // If the Firebase account was created but backend registration failed,
            // sign out so the user is not left in an unintended signed-in state.
            if (firebaseUserCreated && auth.currentUser) {
                try {
                    await signOut(auth);
                } catch (signOutError) {
                    console.error('Firebase sign-out error:', signOutError);
                }
            }

            const messages = {
                'auth/email-already-in-use':
                    'An account with this email already exists. Please sign in instead.',
                'auth/invalid-email':
                    'Please enter a valid email address.',
                'auth/weak-password':
                    'Your password is too weak. Please choose a stronger password.',
                'auth/network-request-failed':
                    'Network error. Please check your internet connection.',
                'auth/too-many-requests':
                    'Too many attempts. Please try again later.'
            };

            setError(
                messages[err.code] ||
                err.message ||
                'Registration failed. Please try again.'
            );

        } finally {
            setBusy(false);
        }
    }

    return (
        <main className="grid max-[760px]:block grid-cols-[22.1%_minmax(0,1fr)] max-[1100px]:grid-cols-[29%_minmax(0,1fr)] w-full h-screen h-[100dvh] max-[760px]:h-auto min-h-[650px] max-[760px]:min-h-[100dvh] overflow-hidden max-[760px]:overflow-visible bg-[#f7f8f0] text-[#071f18] font-['DM_Sans',sans-serif]">

            <aside className="relative isolate overflow-hidden flex flex-col max-[760px]:hidden p-[30px_clamp(22px,2.7vw,48px)] max-[1100px]:p-[26px_22px] text-white bg-[radial-gradient(ellipse_at_45%_100%,#086443_0%,#034c34_42%,transparent_76%),linear-gradient(150deg,#00432d_0%,#003b28_65%,#002e20_100%)]">

                <div className="absolute -z-1 border border-[#b5d368]/32 rounded-full w-[390px] h-[390px] -left-[240px] -bottom-[180px] pointer-events-none" aria-hidden="true" />
                <div className="absolute -z-1 border border-[#b5d368]/32 rounded-full w-[470px] h-[470px] -left-[275px] -bottom-[215px] pointer-events-none" />

                <div className="flex items-center gap-[13px]">
                    <AyurDharaLogo size={46} variant="light" />
                    <div>
                        <strong className="block font-['Cormorant_Garamond',serif] font-bold text-[clamp(20px,1.7vw,30px)] tracking-[2px]">
                            AYURDHARA
                        </strong>
                        <small className="block text-center text-[13px] mt-[1px]">
                            Panchakarma Care
                        </small>
                    </div>
                </div>

                <div className="flex items-center gap-[10px] text-[#9ac64c] my-[16px_20px]">
                    <i className="h-px bg-[#a5c56e] flex-1 not-italic" />
                    <Leaf size={22} />
                    <i className="h-px bg-[#a5c56e] flex-1 not-italic" />
                </div>

                <div className="relative z-2">
                    <span className="text-[12px] font-bold tracking-[2px] text-[#e0edbf] uppercase">
                        BEGIN YOUR WELLNESS JOURNEY
                    </span>

                    <h1 className="font-['Cormorant_Garamond',serif] font-bold text-[clamp(36px,3vw,55px)] max-[1100px]:text-[39px] leading-[0.96] tracking-[-0.5px] my-[22px_16px] text-white">
                        Care that is<br />
                        thoughtfully<br />
                        coordinated.
                        <Sparkles size={24} className="inline text-[#d6ec76] ml-[10px] align-middle" />
                    </h1>

                    <p className="text-[clamp(13px,1vw,17px)] max-[1100px]:text-[13px] leading-[1.55] text-[#edf5e9] max-w-[390px] m-0">

                        Create your patient profile to keep your Panchakarma care, treatment schedule and progress together in one place.
                    </p>
                </div>

                <div className="grid gap-[11px] mt-[22px] relative z-2">
                    <div className="flex items-center gap-[13px] text-[14px] max-[1100px]:text-[12px] leading-[1.35]">
                        <span className="w-[40px] h-[40px] rounded-[11px] bg-[linear-gradient(145deg,#4e9b31,#236d32)] grid place-items-center shrink-0 shadow-[0_5px_14px_#001f173b]">
                            <Heart className="w-[22px] h-[22px]" />
                        </span>
                        Personalized care &amp; tracking
                    </div>

                    <div className="flex items-center gap-[13px] text-[14px] max-[1100px]:text-[12px] leading-[1.35]">
                        <span className="w-[40px] h-[40px] rounded-[11px] bg-[linear-gradient(145deg,#4e9b31,#236d32)] grid place-items-center shrink-0 shadow-[0_5px_14px_#001f173b]">
                            <CalendarDays className="w-[22px] h-[22px]" />
                        </span>
                        Your treatment journey<br /> in one place
                    </div>

                    <div className="flex items-center gap-[13px] text-[14px] max-[1100px]:text-[12px] leading-[1.35]">
                        <span className="w-[40px] h-[40px] rounded-[11px] bg-[linear-gradient(145deg,#4e9b31,#236d32)] grid place-items-center shrink-0 shadow-[0_5px_14px_#001f173b]">
                            <ShieldCheck className="w-[22px] h-[22px]" />
                        </span>
                        Safe, secure and private
                    </div>
                </div>

                <img
                    className="absolute z-1 left-0 bottom-0 block w-full h-[25%] object-cover object-[center_bottom] opacity-96 pointer-events-none [mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.08)_18%,rgba(0,0,0,0.45)_38%,#000_62%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.08)_18%,rgba(0,0,0,0.45)_38%,#000_62%)]"
                    src="/ayurdhara-panchakarma-hero.png"
                    alt="Traditional Ayurvedic wellness arrangement"
                />

                <div className="absolute -z-1 -bottom-[90px] -right-[80px] w-[320px] h-[320px] border border-[#7aa64d]/35 rounded-full pointer-events-none" />
            </aside>

            <section className="flex flex-col h-full max-[760px]:h-auto min-h-0 max-[760px]:min-h-[100dvh] min-w-0 overflow-hidden max-[760px]:overflow-visible bg-[#f7f8f0]">

                <header className="h-[58px] max-[760px]:h-[56px] shrink-0 bg-[#fffefa] border-b border-[#e8ebdf] flex items-center justify-between px-[clamp(22px,3vw,54px)] max-[760px]:px-[15px] text-[14px]">
                    <div className="flex items-center gap-[13px] text-[#004b31]">
                        <Home size={20} />
                        <span>AYURDHARA</span>
                        <b className="text-[#8b948a]">/</b>
                        <strong className="text-[#18211e] font-bold max-[430px]:text-[10px]">
                            Create Patient Account
                        </strong>
                    </div>

                    <div className="text-[#17231d] max-[430px]:text-0">
                        Already have an account?
                        <button
                            type="button"
                            onClick={onBackToLogin}
                            className="border-0 bg-transparent text-[#005333] font-bold text-inherit max-[430px]:text-[12px] ml-[10px] p-[5px] cursor-pointer hover:underline"
                        >
                            Sign In
                        </button>
                    </div>
                </header>

                <div className="flex-1 max-[760px]:flex-none min-h-0 max-[760px]:h-auto max-[760px]:min-h-0 overflow-y-auto max-[760px]:overflow-visible overflow-x-hidden p-[12px_clamp(20px,2.6vw,46px)_30px] max-[1100px]:p-[10px] max-[760px]:p-[12px] [scrollbar-width:thin] [scrollbar-color:#a9bd91_#f4f5ed] [overscroll-behavior:contain]">

                    <div className="relative max-w-[1120px] min-h-full max-[760px]:min-h-0 max-[760px]:h-auto mx-auto p-[20px_clamp(22px,2.5vw,42px)_25px] max-[1500px]:pt-[26px] max-[1100px]:p-[18px_20px] max-[760px]:p-[17px_15px] bg-[#fffefa] border border-[#edf0e6] rounded-[26px] max-[760px]:rounded-[18px] shadow-[0_10px_30px_#24452b12] overflow-hidden max-[760px]:overflow-visible">

                        <div className="flex items-center gap-[17px] relative mb-[14px]">

                            <div className="w-[62px] h-[62px] rounded-[16px] bg-[#edf5d9] text-[#064e32] grid place-items-center relative shrink-0">
                                <UserRound size={32} />
                                <span className="absolute right-[5px] bottom-[5px] bg-[#edf5d9] rounded-full p-[2px] leading-none text-[#064e32]">
                                    <Plus size={13} strokeWidth={3} />
                                </span>
                            </div>

                            <div>
                                <h2 className="font-['Cormorant_Garamond',serif] font-bold text-[clamp(28px,2.5vw,40px)] max-[1100px]:text-[30px] max-[430px]:text-[24px] leading-none m-[0_0_4px] text-[#071a13]">
                                    Create Your Patient Account
                                </h2>
                                <p className="text-[14px] text-[#293b55] m-0">
                                    Enter your details below. Fields marked <b className="text-[#df2626]">*</b> are required.
                                </p>
                            </div>

                            <div className="absolute right-0 -top-[14px] text-[#c8dfa2] opacity-60 pointer-events-none select-none max-[760px]:hidden">
                                <Leaf size={68} strokeWidth={1.5} className="rotate-12" />
                            </div>
                        </div>

                        <form onSubmit={submit}>

                            {/* PROFILE PHOTO */}
                            <div className="flex items-center gap-[17px] my-[8px_15px] max-[1500px]:mb-[20px] ml-[24px]">
                                <div className="w-[86px] h-[86px] rounded-full border-2 border-[#8fc75b] bg-[#e6eadf] grid place-items-center text-[#9aa39b] relative shrink-0 overflow-visible">
                                    {photo ? (
                                        <img
                                            src={photo}
                                            alt="Profile preview"
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <UserRound size={54} strokeWidth={1.1} />
                                    )}

                                    <button
                                        type="button"
                                        aria-label="Upload profile photo"
                                        onClick={() => fileRef.current?.click()}
                                        className="absolute -right-[1px] -bottom-[1px] w-[29px] h-[29px] rounded-full border-2 border-white bg-[#005333] text-white grid place-items-center cursor-pointer"
                                    >

                                        <Camera size={17} />
                                    </button>
                                </div>

                                <div className="flex flex-col gap-[4px]">
                                    <strong className="text-[15px] max-[430px]:text-[13px] text-[#06432c] font-bold">
                                        Profile Photo <em className="not-italic font-normal text-[#35455b]">(Optional)</em>
                                    </strong>

                                    <small className="text-[12px] max-[430px]:text-[10px] text-[#4e5a65]">
                                        Upload a clear photo (JPG, PNG) · Max 2 MB
                                    </small>


                                    <div className="flex gap-[10px] mt-[5px]">
                                        <button
                                            type="button"
                                            className="h-[32px] rounded-[8px] px-[12px] flex items-center gap-[8px] text-[12px] font-bold bg-white border border-[#79a66b] text-[#064c30] cursor-pointer hover:bg-[#f6fbf4] transition-colors"
                                            onClick={() => fileRef.current?.click()}
                                        >
                                            <Upload size={17} />
                                            Upload Photo
                                        </button>

                                        {photo && (
                                            <button
                                                type="button"
                                                className="h-[32px] rounded-[8px] px-[12px] flex items-center gap-[8px] text-[12px] font-bold bg-[#f7f7f5] border border-[#d8ddd5] text-[#59635e] cursor-pointer hover:bg-[#edece8] transition-colors"
                                                onClick={() => {
                                                    setPhoto('');
                                                    if (fileRef.current) fileRef.current.value = '';
                                                }}
                                            >
                                                <Trash2 size={16} />
                                                Remove
                                            </button>
                                        )}
                                    </div>

                                    <input
                                        ref={fileRef}
                                        hidden
                                        type="file"
                                        accept="image/png,image/jpeg"
                                        onChange={choosePhoto}
                                    />
                                </div>
                            </div>

                            {/* PERSONAL DETAILS */}
                            <div className="h-[35px] flex items-center gap-[12px] px-[14px] my-[12px_8px] max-[1500px]:mt-[15px] rounded-[14px] bg-[linear-gradient(90deg,#e8f3cc,#eff5d9)] text-[#063b27]">

                                <UserRound className="w-[21px] h-[21px]" />
                                <span className="h-[29px] min-w-[43px] px-[10px] rounded-[18px] bg-[linear-gradient(135deg,#78ae32,#4e8d1f)] text-white text-center font-['Cormorant_Garamond',serif] font-bold text-[17px] grid place-items-center">
                                    01
                                </span>
                                <strong className="font-['Cormorant_Garamond',serif] font-bold text-[20px] max-[430px]:text-[17px]">
                                    Personal Details
                                </strong>
                            </div>

                            <div className="grid grid-cols-2 max-[430px]:grid-cols-1 [column-gap:28px] max-[1100px]:[column-gap:14px] row-gap-[9px] max-[1500px]:row-gap-[12px] p-[0_10px_3px]">


                                <Field label="Full Name" icon={UserRound} required className="col-span-2 max-[430px]:col-span-1">
                                    <input
                                        required
                                        autoComplete="name"
                                        value={form.name}
                                        onChange={e => update('name', e.target.value)}
                                        placeholder="Enter your full name"
                                        className="h-full w-full min-w-0 border-0 outline-none bg-transparent text-[#17243a] font-['DM_Sans',sans-serif] font-medium text-[13px] placeholder:text-[#87939c]"
                                    />
                                </Field>

                                <Field label="Email Address" icon={Mail} required>
                                    <input
                                        required
                                        type="email"
                                        autoComplete="email"
                                        value={form.email}
                                        onChange={e => update('email', e.target.value)}
                                        placeholder="you@example.com"
                                        className="h-full w-full min-w-0 border-0 outline-none bg-transparent text-[#17243a] font-['DM_Sans',sans-serif] font-medium text-[13px] placeholder:text-[#87939c]"
                                    />
                                </Field>

                                <Field label="Phone Number" icon={Phone} required>
                                    <input
                                        required
                                        type="tel"
                                        autoComplete="tel"
                                        value={form.phone_number}
                                        onChange={e => update('phone_number', e.target.value)}
                                        placeholder="Enter your phone number"
                                        className="h-full w-full min-w-0 border-0 outline-none bg-transparent text-[#17243a] font-['DM_Sans',sans-serif] font-medium text-[13px] placeholder:text-[#87939c]"
                                    />
                                </Field>

                                <Field
                                    label={<>Gender <em className="not-italic font-normal text-[#35455b]">(Optional)</em></>}
                                    icon={Mars}
                                >
                                    <select
                                        value={form.gender}
                                        onChange={e => update('gender', e.target.value)}
                                        className="h-full w-full min-w-0 border-0 outline-none bg-transparent text-[#17243a] font-['DM_Sans',sans-serif] font-medium text-[13px] appearance-auto cursor-pointer"
                                    >
                                        <option value="">Select gender</option>
                                        <option>Female</option>
                                        <option>Male</option>
                                        <option>Other</option>
                                        <option>Prefer not to say</option>
                                    </select>
                                </Field>

                                <Field
                                    label={<>Blood Group <em className="not-italic font-normal text-[#35455b]">(Optional)</em></>}
                                    icon={Droplet}
                                >
                                    <select
                                        value={form.blood_group}
                                        onChange={e => update('blood_group', e.target.value)}
                                        className="h-full w-full min-w-0 border-0 outline-none bg-transparent text-[#17243a] font-['DM_Sans',sans-serif] font-medium text-[13px] appearance-auto cursor-pointer"
                                    >
                                        <option value="">Select group</option>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(v => (
                                            <option key={v}>{v}</option>
                                        ))}
                                    </select>
                                </Field>
                            </div>

                            {/* ACCOUNT DETAILS */}
                            <div className="h-[35px] flex items-center gap-[12px] px-[14px] my-[12px_8px] max-[1500px]:mt-[15px] rounded-[14px] bg-[linear-gradient(90deg,#e8f3cc,#eff5d9)] text-[#063b27]">

                                <LockKeyhole className="w-[21px] h-[21px]" />
                                <span className="h-[29px] min-w-[43px] px-[10px] rounded-[18px] bg-[linear-gradient(135deg,#78ae32,#4e8d1f)] text-white text-center font-['Cormorant_Garamond',serif] font-bold text-[17px] grid place-items-center">
                                    02
                                </span>
                                <strong className="font-['Cormorant_Garamond',serif] font-bold text-[20px] max-[430px]:text-[17px]">
                                    Account Details
                                </strong>
                            </div>

                            <div className="grid grid-cols-2 max-[430px]:grid-cols-1 [column-gap:28px] max-[1100px]:[column-gap:14px] row-gap-[9px] max-[1500px]:row-gap-[12px] p-[0_10px_3px]">


                                <Field label="Password" icon={LockKeyhole} required>
                                    <input
                                        required
                                        minLength={8}
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        value={form.password}
                                        onChange={e => update('password', e.target.value)}
                                        placeholder="At least 8 characters"
                                        className="h-full w-full min-w-0 border-0 outline-none bg-transparent text-[#17243a] font-['DM_Sans',sans-serif] font-medium text-[13px] placeholder:text-[#87939c]"
                                    />

                                    <button
                                        className="border-0 bg-transparent text-[#075332] grid place-items-center p-[4px] cursor-pointer"
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        aria-label="Toggle password visibility"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </Field>

                                <Field label="Confirm Password" icon={LockKeyhole} required>
                                    <input
                                        required
                                        minLength={8}
                                        type={showConfirm ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        value={form.confirmPassword}
                                        onChange={e => update('confirmPassword', e.target.value)}
                                        placeholder="Re-enter your password"
                                        className="h-full w-full min-w-0 border-0 outline-none bg-transparent text-[#17243a] font-['DM_Sans',sans-serif] font-medium text-[13px] placeholder:text-[#87939c]"
                                    />

                                    <button
                                        className="border-0 bg-transparent text-[#075332] grid place-items-center p-[4px] cursor-pointer"
                                        type="button"
                                        onClick={() => setShowConfirm(v => !v)}
                                        aria-label="Toggle confirm password visibility"
                                    >
                                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </Field>
                            </div>

                            {/* PASSWORD STRENGTH */}
                            <div className="grid grid-cols-2 max-[430px]:grid-cols-1 gap-[3px_28px] px-[14px] mt-[3px] text-[12px] text-[#182a22]">

                                <div className="flex items-center gap-[8px]">
                                    Password strength:
                                    <b className={
                                        strength >= 3
                                            ? 'text-[#12833d]'
                                            : strength === 2
                                                ? 'text-[#b27b16]'
                                                : 'text-[#b43d31]'
                                    }>
                                        {!form.password
                                            ? '—'
                                            : strength >= 3
                                                ? 'Strong'
                                                : strength === 2
                                                    ? 'Medium'
                                                    : 'Weak'
                                        }
                                    </b>


                                    <div className="flex gap-[4px] flex-1 max-w-[185px]">
                                        {[1, 2, 3, 4].map(level => (
                                            <i
                                                key={level}
                                                className={`h-[5px] rounded-[5px] flex-1 not-italic ${strength >= level
                                                        ? 'bg-[linear-gradient(90deg,#0a653c,#22a34c)]'
                                                        : 'bg-[#dfe4dd]'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <ul className="col-span-2 max-[430px]:col-span-1 list-none m-[2px_0_0] p-0 grid grid-cols-2 max-[430px]:grid-cols-1 gap-[3px_10px]">
                                    {[
                                        ['length', 'At least 8 characters'],
                                        ['upper', 'One uppercase letter'],
                                        ['number', 'One number'],
                                        ['special', 'One special character']
                                    ].map(([key, label]) => (

                                        <li className="flex items-center gap-[6px] text-[#344050]" key={key}>
                                            <CheckCircle2
                                                size={14}
                                                className={checks[key] ? 'fill-[#4a9b20] text-white' : 'text-[#b4bcb5]'}
                                            />
                                            {label}
                                        </li>
                                    ))}
                                </ul>

                                {form.confirmPassword && (
                                    <p className={`col-span-2 max-[430px]:col-span-1 m-[3px_0] font-semibold flex items-center gap-1 ${form.password === form.confirmPassword
                                            ? 'text-[#14833c]'
                                            : 'text-[#bd302b]'
                                        }`}>
                                        {form.password === form.confirmPassword ? (
                                            <>
                                                <Check size={14} strokeWidth={2.5} />
                                                <span>Passwords match.</span>
                                            </>
                                        ) : (
                                            'Passwords do not match.'
                                        )}
                                    </p>
                                )}
                            </div>

                            {/* HEALTH AND CONTACT DETAILS */}
                            <div className="h-[35px] flex items-center gap-[12px] px-[14px] my-[12px_8px] max-[1500px]:mt-[15px] rounded-[14px] bg-[linear-gradient(90deg,#e8f3cc,#eff5d9)] text-[#063b27]">
                                <Heart className="w-[21px] h-[21px]" />

                                <span className="h-[29px] min-w-[43px] px-[10px] rounded-[18px] bg-[linear-gradient(135deg,#78ae32,#4e8d1f)] text-white text-center font-['Cormorant_Garamond',serif] font-bold text-[17px] grid place-items-center">
                                    03
                                </span>

                                <strong className="font-['Cormorant_Garamond',serif] font-bold text-[20px] max-[430px]:text-[17px]">
                                    Health &amp; Contact Details
                                </strong>

                                <small className="ml-auto text-[#69756d] text-[12px] font-['DM_Sans',sans-serif] font-normal max-[430px]:hidden">
                                    Optional — you can complete these later.
                                </small>
                            </div>

                            <div className="grid grid-cols-2 max-[430px]:grid-cols-1 [column-gap:28px] max-[1100px]:[column-gap:14px] row-gap-[9px] max-[1500px]:row-gap-[12px] p-[0_10px_3px]">


                                <Field label="Height (cm)" icon={Ruler}>
                                    <input
                                        type="number"
                                        min="1"
                                        max="300"
                                        step="0.1"
                                        value={form.height}
                                        onChange={e => update('height', e.target.value)}
                                        placeholder="e.g. 165"
                                        className="h-full w-full min-w-0 border-0 outline-none bg-transparent text-[#17243a] font-['DM_Sans',sans-serif] font-medium text-[13px] placeholder:text-[#87939c]"
                                    />
                                </Field>

                                <Field label="Weight (kg)" icon={Weight}>
                                    <input
                                        type="number"
                                        min="1"
                                        max="500"
                                        step="0.1"
                                        value={form.weight}
                                        onChange={e => update('weight', e.target.value)}
                                        placeholder="e.g. 60"
                                        className="h-full w-full min-w-0 border-0 outline-none bg-transparent text-[#17243a] font-['DM_Sans',sans-serif] font-medium text-[13px] placeholder:text-[#87939c]"
                                    />
                                </Field>

                                <Field label="Address" icon={MapPin} className="col-span-2 max-[430px]:col-span-1">
                                    <input
                                        value={form.address}
                                        onChange={e => update('address', e.target.value)}
                                        placeholder="Enter your residential address"
                                        className="h-full w-full min-w-0 border-0 outline-none bg-transparent text-[#17243a] font-['DM_Sans',sans-serif] font-medium text-[13px] placeholder:text-[#87939c]"
                                    />
                                </Field>
                            </div>

                            {/* ERROR AND SUCCESS MESSAGES */}
                            {error && (
                                <div
                                    className="p-[9px_12px] rounded-[8px] text-[13px] my-[8px] mx-[10px] bg-[#fff0ee] text-[#b3261e]"
                                    role="alert"
                                >
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div
                                    className="p-[9px_12px] rounded-[8px] text-[13px] my-[8px] mx-[10px] bg-[#edf8ed] text-[#176b35]"
                                    role="status"
                                >
                                    {success}
                                </div>
                            )}

                            {/* REGISTER BUTTON */}
                            <button
                                className="h-[43px] w-full border-0 rounded-[13px] bg-[linear-gradient(100deg,#087445,#00482f)] text-white font-['Cormorant_Garamond',serif] font-bold text-[18px] shadow-[0_6px_14px_#00533325] flex items-center justify-center gap-[12px] mt-[13px] cursor-pointer hover:brightness-105 transition-all disabled:opacity-65 disabled:cursor-wait"
                                type="submit"
                                disabled={busy}
                            >
                                <span>
                                    {busy ? 'Creating Account…' : 'Create Patient Account'}
                                </span>

                                <ArrowRight size={18} strokeWidth={2.2} />
                            </button>
                        </form>

                        <div className="text-center mt-[9px] text-[#19233b] text-[14px]">
                            Already have an account?

                            <button
                                type="button"
                                onClick={onBackToLogin}
                                className="border-0 bg-transparent text-[#005333] font-bold text-[17px] ml-[10px] p-[5px] cursor-pointer hover:underline"
                            >
                                Sign In
                            </button>
                        </div>

                    </div>
                </div>
            </section>
        </main>
    );
}
