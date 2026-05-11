/* feedback.js - Feedback Form Submission */

document.addEventListener('DOMContentLoaded', () => {
  const feedbackForm = document.getElementById('feedback-form');

  if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(feedbackForm);
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        first_time: formData.get('first_time'),
        service: formData.get('service'),
        rating: parseInt(formData.get('rating')),
        recommend: formData.get('recommend'),
        comments: formData.get('comments')
      };

      try {
        const response = await fetch('/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          alert('Thank you for your feedback! We appreciate your time.');
          feedbackForm.reset();
        } else {
          const result = await response.json();
          alert('Failed to send feedback: ' + result.error);
        }
      } catch (err) {
        console.error('Error sending feedback:', err);
        alert('An error occurred. Please try again later.');
      }
    });
  }
});
