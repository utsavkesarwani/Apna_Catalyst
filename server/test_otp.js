async function test() {
  try {
    const res1 = await fetch('http://127.0.0.1:5000/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '9988776655' })
    });
    const data1 = await res1.json();
    console.log('SEND OTP:', data1);

    const res2 = await fetch('http://127.0.0.1:5000/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '9988776655', otp: '123456' })
    });
    const data2 = await res2.json();
    console.log('VERIFY OTP:', data2);
  } catch(e) {
    console.error(e);
  }
}
test();
