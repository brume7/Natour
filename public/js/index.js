import '@babel/polyfill';
import { login } from './login';
import { mapFunc } from './mapbox';
import { signUP } from './signUp';
import { deleteReviewView } from './review';

const mapDiv = document.getElementById('map');
let alertClass =
  'fixed text-white right-3 top-[120px] min-h-[60px] max-w-[100vw] w-[300px] sm:w-[400px] z-50 rounded-[5px] text-lg font-bold flex flex-col justify-center pl-5 animate__animated';
const alertBox = document.getElementById('alert-box');

if (alertBox) {
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
}

if (mapDiv) {
  const locations = JSON.parse(mapDiv.dataset.locations);
  mapFunc(locations);
}

const form = document.getElementById('login-form');

if (form) {
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password, alertBox, alertClass);
  });
}

const signUpForm = document.getElementById('signUp-form');

if (signUpForm) {
  signUpForm.addEventListener('submit', (ev) => {
    ev.preventDefault();

    const name = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('rePassword').value;

    signUP(name, email, password, passwordConfirm, alertBox, alertClass);
  });
}

const delete_review_btns = document.querySelectorAll('#delete-review-btn');

if (delete_review_btns.length) {
  for (const el of delete_review_btns) {
    el.addEventListener('click', async () => {
      el.style.display = 'none';
      await deleteReviewView(el.dataset.id, el.dataset.tourid, alertBox, alertClass);
      el.style.display = 'inline';
      location.reload();
    });
  }
}
