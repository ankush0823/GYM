
  const API_URL = "http://localhost:5000/api";
  let userEmail = "";
  let resendCooldown = null;

  // ─── STEP NAVIGATION ───────────────────────────────────────────
  function goToStep(n) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById('step' + n).classList.add('active');
    updateDots(n);
  }

  function updateDots(n) {
    for (let i = 1; i <= 3; i++) {
      const dot = document.getElementById('dot' + i);
      dot.classList.remove('active', 'done');
      if (i < n) dot.classList.add('done');
      else if (i === n) dot.classList.add('active');
    }
  }

  // ─── STEP 1: SEND OTP ──────────────────────────────────────────
  async function sendOTP() {
    const email = document.getElementById('emailInput').value.trim();
    if (!email || !email.includes('@')) {
      alert("Please enter a valid email address.");
      return;
    }

    userEmail = email;
    const btn = document.getElementById('sendOtpBtn');
    const loading = document.getElementById('loadingMsg');

    btn.disabled = true;
    btn.textContent = "Sending...";
    loading.style.display = "block";

    try {
      const res = await fetch(`${API_URL}/admin/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        document.getElementById('otpSentMsg').textContent = `A 6-digit code was sent to ${email}`;
        goToStep(2);
        startResendTimer(60);
      } else {
        alert(data.message || "Could not send OTP. Check your email and try again.");
        btn.disabled = false;
        btn.textContent = "Send OTP";
      }
    } catch (err) {
      alert("Server error. Please try again.");
      btn.disabled = false;
      btn.textContent = "Send OTP";
      console.error(err);
    } finally {
      loading.style.display = "none";
    }
  }

  // ─── RESEND TIMER ──────────────────────────────────────────────
  function startResendTimer(seconds) {
    const link = document.getElementById('resendLink');
    const timer = document.getElementById('resendTimer');
    link.classList.add('disabled');

    let remaining = seconds;
    timer.textContent = ` (${remaining}s)`;

    if (resendCooldown) clearInterval(resendCooldown);

    resendCooldown = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearInterval(resendCooldown);
        timer.textContent = '';
        link.classList.remove('disabled');
      } else {
        timer.textContent = ` (${remaining}s)`;
      }
    }, 1000);
  }

  async function resendOTP() {
    await sendOTPRequest();
    startResendTimer(60);
  }

  async function sendOTPRequest() {
    try {
      await fetch(`${API_URL}/admin/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail })
      });
    } catch(err) {
      console.error(err);
    }
  }

  // ─── STEP 2: VERIFY OTP ────────────────────────────────────────
  async function verifyOTP() {
    const entered =
      document.getElementById('otp1').value +
      document.getElementById('otp2').value +
      document.getElementById('otp3').value +
      document.getElementById('otp4').value +
      document.getElementById('otp5').value +
      document.getElementById('otp6').value;

    if (entered.length < 6) {
      alert("Please enter the complete 6-digit OTP.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/admin/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, otp: entered })
      });

      const data = await res.json();

      if (res.ok) {
        goToStep(3);
      } else {
        alert(data.message || "Incorrect OTP. Please try again.");
        ['otp1','otp2','otp3','otp4','otp5','otp6'].forEach(id => {
          document.getElementById(id).value = '';
        });
        document.getElementById('otp1').focus();
      }
    } catch (err) {
      alert("Server error. Please try again.");
      console.error(err);
    }
  }

  // ─── PASSWORD STRENGTH ─────────────────────────────────────────
  function checkStrength(val) {
    const bar = document.getElementById('strengthBar');
    const label = document.getElementById('strengthLabel');
    let strength = 0;
    if (val.length >= 8) strength++;
    if (/[A-Z]/.test(val)) strength++;
    if (/[0-9]/.test(val)) strength++;
    if (/[^A-Za-z0-9]/.test(val)) strength++;

    const map = {
      0: { w: '0%', c: '#444', t: '' },
      1: { w: '25%', c: '#e74c3c', t: 'Weak' },
      2: { w: '50%', c: '#e67e22', t: 'Fair' },
      3: { w: '75%', c: '#f1c40f', t: 'Good' },
      4: { w: '100%', c: '#2ecc71', t: 'Strong' }
    };

    bar.style.width = map[strength].w;
    bar.style.background = map[strength].c;
    label.textContent = map[strength].t;
    label.style.color = map[strength].c;
  }

  // ─── STEP 3: UPDATE PASSWORD ───────────────────────────────────
  async function updatePassword() {
    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmPassword').value;

    if (newPass.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    if (newPass !== confirmPass) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/admin/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, newPassword: newPass })
      });

      const data = await res.json();

      if (res.ok) {
        goToStep(4);
      } else {
        alert(data.message || "Failed to update password. Please try again.");
      }
    } catch (err) {
      alert("Server error. Please try again.");
      console.error(err);
    }
  }

  // ─── OTP INPUT NAVIGATION ──────────────────────────────────────
  const otpIds = ['otp1','otp2','otp3','otp4','otp5','otp6'];
  otpIds.forEach((id, i) => {
    const input = document.getElementById(id);

    input.addEventListener('keypress', e => {
      if (!/[0-9]/.test(e.key)) e.preventDefault();
    });

    input.addEventListener('input', () => {
      if (input.value.length === 1 && i < otpIds.length - 1) {
        document.getElementById(otpIds[i + 1]).focus();
      }
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && input.value === '' && i > 0) {
        document.getElementById(otpIds[i - 1]).focus();
      }
    });
  });