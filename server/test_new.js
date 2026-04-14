async function testNew() {
  try {
    const res1 = await fetch('http://127.0.0.1:5000/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '8888888888' })
    });
    console.log('SEND OTP:', await res1.json());

    const res2 = await fetch('http://127.0.0.1:5000/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '8888888888', otp: '123456' })
    });
    console.log('VERIFY OTP 1:', await res2.json());

    const res3 = await fetch('http://127.0.0.1:5000/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '8888888888', otp: '123456', name: 'New User' })
    });
    console.log('VERIFY OTP 2:', await res3.json());
  } catch(e) { console.error(e); }
}
testNew();
