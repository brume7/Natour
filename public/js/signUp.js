import axios from 'axios';

export const signUP = async (name, email, password, passwordConfirm, alertBox, alertClass) => {
  try {
    if (password != passwordConfirm) {
      throw new Error('Passwords do not match');
    }
    const user = await axios.post('/api/v1/users/signup', {
      name,
      email,
      password,
      passwordConfirm,
    });
    alertBox.removeAttribute('class');
    alertBox.setAttribute('class', alertClass + ' bg-[#55c57a] animate__slideInRight');

    alertBox.innerText = user.data.status;
    let alertTimeout = setTimeout(() => {
      alertBox.removeAttribute('class');
      alertBox.setAttribute('class', `${alertClass} hidden`);
      clearTimeout(alertTimeout);
    }, 3000);
    let windowsTimeout = window.setTimeout(() => {
      window.location.href = '/';
      window.clearTimeout(windowsTimeout);
    }, 1500);
  } catch (err) {
    alertBox.removeAttribute('class');
    alertBox.setAttribute('class', alertClass + ' bg-[#dd0000] animate__slideInRight');
    if (err.response) {
      alertBox.innerText = err.response.data.message;
    } else {
      if ((err.message = 'Passwords do not match')) {
        alertBox.innerText = err.message;
      } else {
        alertBox.innerText = 'check your internet connection';
      }
    }
    let alertTimeout = setTimeout(() => {
      alertBox.removeAttribute('class');
      alertBox.setAttribute('class', `${alertClass} hidden`);
      clearTimeout(alertTimeout);
    }, 3000);
  }
};
