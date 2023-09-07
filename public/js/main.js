const registrationForm = document.getElementById('registration-form');
const loginForm = document.getElementById('login-form');
const googleSignInButton = document.getElementById('google-signin-button');


const registrationUrl = '/register';
const loginUrl = '/login';
const googleLoginURL = '/google-signin'

registrationForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  try {
    const response = await fetch(registrationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      alert('Registration successful!');
      window.location.href = '/dashboard';
    } else {
      const data = await response.json();
      alert(`${data.message}: ${data.error}`);
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      alert('Login successful!');
      window.location.href = '/dashboard';
    } else {
      const data = await response.json();
      alert(`${data.message}: ${data.error}`);
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
});


googleSignInButton.addEventListener('click', async () => {
  try {
    const response = await fetch('/google-signin');

    if (response.ok) {
      window.location.href = '/dashboard'; 
    } else {
      const data = await response.json();
      alert(`${data.message}: ${data.error}`);
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
});

  