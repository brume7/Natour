import axios from 'axios';

export const deleteReviewView = async (id, tour_id, alertBox, alertClass) => {
  try {
    const res = await axios.delete(`/api/v1/reviews/${id}`);
    const updateres = await axios.get(`/api/v1/reviews/update/tour/${tour_id}`);
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
