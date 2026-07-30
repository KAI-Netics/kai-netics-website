// KAI-Netics shared form handler
// - Normalizes loose URL input (adds https:// if missing a scheme)
// - Submits forms via fetch() to Formspree so the page never navigates away
// - Shows an inline success/error message next to the form

(function () {
  function normalizeUrlFields(form) {
    var urlFields = form.querySelectorAll('[data-urlfield]');
    urlFields.forEach(function (field) {
      var value = field.value.trim();
      if (!value) return;
      if (!/^https?:\/\//i.test(value)) {
        value = 'https://' + value;
      }
      field.value = value;
    });
  }

  function isLikelyUrl(value) {
    return /^https?:\/\/[^\s.]+\.[^\s]{2,}$/i.test(value);
  }

  function showStatus(statusEl, message, type) {
    statusEl.textContent = message;
    statusEl.className = 'form-status ' + type;
    statusEl.hidden = false;
  }

  function handleSubmit(event) {
    var form = event.target;
    if (!form.matches('[data-ajax-form]')) return;
    event.preventDefault();

    var statusEl = form.parentElement.querySelector('.form-status');
    var submitBtn = form.querySelector('button[type="submit"]');

    normalizeUrlFields(form);

    var urlFields = form.querySelectorAll('[data-urlfield]');
    for (var i = 0; i < urlFields.length; i++) {
      var f = urlFields[i];
      if (f.required && !isLikelyUrl(f.value)) {
        if (statusEl) {
          showStatus(statusEl, 'Please enter a valid website, portfolio, or LinkedIn URL (example: https://www.example.com).', 'error');
        }
        f.focus();
        return;
      }
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.originalText = submitBtn.dataset.originalText || submitBtn.textContent;
      submitBtn.textContent = 'Submitting…';
    }

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then(function (response) {
        if (response.ok) {
          form.reset();
          if (statusEl) {
            showStatus(
              statusEl,
              'Thank you — your submission was received. KAI-Netics will follow up within one business day.',
              'success'
            );
          }
        } else {
          return response.json().then(function (data) {
            var message =
              data && data.errors && data.errors.length
                ? data.errors.map(function (e) { return e.message; }).join(' ')
                : 'Something went wrong submitting the form.';
            throw new Error(message);
          });
        }
      })
      .catch(function (err) {
        if (statusEl) {
          showStatus(
            statusEl,
            (err && err.message ? err.message : 'Something went wrong.') +
              ' Please try again or email kas@kai-netics.com directly.',
            'error'
          );
        }
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.originalText;
        }
      });
  }

  document.addEventListener('submit', handleSubmit, true);
})();