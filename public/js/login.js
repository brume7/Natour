const form = document.getElementById('login-form');
let alertClass =
  'fixed text-white right-3 top-[120px] min-h-[60px] max-w-[100vw] w-[300px] sm:w-[400px] z-50 rounded-[5px] text-lg font-bold flex flex-col justify-center pl-5 animate__animated';
const alertBox = document.getElementById('alert-box');

if (alertBox.dataset.error && alertBox.dataset.error != `${undefined}`) {
  alertBox.removeAttribute('class');
  alertBox.setAttribute('class', alertClass + ' bg-[#dd0000] animate__slideInRight');

  alertBox.innerText = alertBox.dataset.error;

  let alertTimeout = setTimeout(() => {
    alertBox.removeAttribute('class');
    alertBox.setAttribute('class', `${alertClass} hidden`);
    clearTimeout(alertTimeout);
  }, 3000);
}

form.addEventListener('submit', (ev) => {
  ev.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  login(email, password);
});

const login = async (email, password) => {
  try {
    const user = await axios.post('/api/v1/users/login', {
      email,
      password,
    });
    alertBox.removeAttribute('class');
    alertBox.setAttribute('class', alertClass + ' bg-[#55c57a] animate__slideInRight');

    alertBox.innerText = user.data.status;
    let alertTimeout = setTimeout(() => {
      alertBox.removeAttribute('class');
      alertBox.setAttribute('class', `${alertClass} hidden`);
      clearTimeout(alertTimeout);
    }, 3000);
    window.location.href = '/';
  } catch (err) {
    alertBox.removeAttribute('class');
    alertBox.setAttribute('class', alertClass + ' bg-[#dd0000] animate__slideInRight');
    if (err.response) {
      alertBox.innerText = err.response.data.message;
    } else {
      alertBox.innerText = 'check your internet connection';
    }
    let alertTimeout = setTimeout(() => {
      alertBox.removeAttribute('class');
      alertBox.setAttribute('class', `${alertClass} hidden`);
      clearTimeout(alertTimeout);
    }, 3000);
  }
};
