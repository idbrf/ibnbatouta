/**
 * وكالة كراء السيارات ابن بطوطة - Contact Form Handler
 */

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('agencyContactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const fullName = contactForm.fullName.value.trim();
    const email = contactForm.email.value.trim();
    const phone = contactForm.phone ? contactForm.phone.value.trim() : '';
    const subject = contactForm.subject ? contactForm.subject.value.trim() : 'استفسار عام';
    const message = contactForm.message.value.trim();

    // Validation
    if (!fullName) {
      showToast('يرجى كتابة الاسم الكامل', 'error');
      contactForm.fullName.focus();
      return;
    }

    if (!email || !isValidEmail(email)) {
      showToast('يرجى إدخال بريد إلكتروني صحيح', 'error');
      contactForm.email.focus();
      return;
    }

    if (!message || message.length < 10) {
      showToast('يرجى كتابة نص الرسالة (10 أحرف على الأقل)', 'error');
      contactForm.message.focus();
      return;
    }

    // Save message to localStorage
    const contactMessage = {
      id: 'MSG-' + Date.now(),
      fullName,
      email,
      phone,
      subject,
      message,
      date: new Date().toLocaleString('ar-MA')
    };

    const storedMessages = JSON.parse(localStorage.getItem('ibn_batouta_messages') || '[]');
    storedMessages.push(contactMessage);
    localStorage.setItem('ibn_batouta_messages', JSON.stringify(storedMessages));

    // UI Feedback
    showToast(`شكراً لك أستاذ ${fullName}! تم إرسال رسالتك بنجاح وسيتواصل معك فريقنا في أقرب وقت.`, 'success');

    // Show inline alert in form
    const alertBox = document.getElementById('contactSuccessAlert');
    if (alertBox) {
      alertBox.style.display = 'flex';
      setTimeout(() => {
        alertBox.style.display = 'none';
      }, 7000);
    }

    contactForm.reset();
  });
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
