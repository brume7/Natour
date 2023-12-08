import axios from 'axios';

export const deleteReviewView = async (id, tour_id, alertBox, alertClass) => {
  try {
    const res = await axios.delete(`/api/v1/reviews/${id}`);
    const updateres = await axios.get(`/api/v1/reviews/update/tour/${tour_id}`);
    location.reload();
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

export const postReviewView = async (rating, review, tour_id, alertBox, alertClass) => {
  try {
    if (!rating) {
      throw new Error('Cannot submit review without rating');
    }
    if (!tour_id) {
      throw new Error('Please refresh an try again');
    }
    if (review.length < 6) {
      throw new Error('Review is short');
    }
    if (review) {
      const res = await axios.post(`/api/v1/tours/${tour_id}/reviews`, {
        rating,
        review,
      });
    } else {
      const res = await axios.post(`/api/v1/tours/${tour_id}/reviews`, {
        rating,
      });
    }
    location.reload();
  } catch (err) {
    alertBox.removeAttribute('class');
    alertBox.setAttribute('class', alertClass + ' bg-[#dd0000] animate__slideInRight');
    if (!err.response) {
      alertBox.innerText = err.message;
    } else {
      alertBox.innerText = err.response.data.message;
    }

    let alertTimeout = setTimeout(() => {
      alertBox.removeAttribute('class');
      alertBox.setAttribute('class', `${alertClass} hidden`);
      clearTimeout(alertTimeout);
    }, 3000);
  }
};
