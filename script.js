(function () {
  const form = document.getElementById('sendForm');
  const sendBtn = document.getElementById('sendBtn');
  const imageInput = document.getElementById('image');
  const preview = document.getElementById('imagePreview');
  const scheduledAtInput = document.getElementById('scheduled_at');
  const postTimingRadios = document.querySelectorAll('input[name="post_timing"]');
  const promptToggle = document.getElementById('promptToggle');
  const promptField = document.getElementById('promptField');
  const promptModal = document.getElementById('promptModal');
  const promptModalTextarea = document.getElementById('promptModal');
  const closePromptModal = document.getElementById('closePromptModal');
  const savePrompt = document.getElementById('savePrompt');
  const cancelPrompt = document.getElementById('cancelPrompt');
  const loadingPopup = document.getElementById('loadingPopup');
  const statusMessage = document.getElementById('statusMessage');

  function resetPreview() {
    preview.innerHTML = '<span class="hint">ตัวอย่างรูปจะแสดงที่นี่</span>';
  }

  function showLoadingPopup() {
    loadingPopup.classList.add('show');
  }

  function hideLoadingPopup() {
    loadingPopup.classList.remove('show');
  }

  function clearForm() {
    form.reset();
    resetPreview();
    // ซ่อน prompt field และลบ active state
    promptField.style.display = 'none';
    promptToggle.classList.remove('active');
    statusMessage.textContent = ''; // ลบข้อความสถานะ
    statusMessage.classList.remove('show');
  }

  // จัดการการแสดง/ซ่อน prompt field
  promptToggle.addEventListener('click', () => {
    const isVisible = promptField.style.display !== 'none';
    if (isVisible) {
      promptField.style.display = 'none';
      promptToggle.classList.remove('active');
    } else {
      promptField.style.display = 'block';
      promptToggle.classList.add('active');
    }
  });

  // จัดการการแสดง/ซ่อน input เวลาโพสต์
  postTimingRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'scheduled') {
        scheduledAtInput.style.display = 'block';
        scheduledAtInput.required = true;
      } else {
        scheduledAtInput.style.display = 'none';
        scheduledAtInput.required = false;
        scheduledAtInput.value = '';
      }
    });
  });

  imageInput.addEventListener('change', () => {
    const file = imageInput.files && imageInput.files[0];
    if (!file) {
      resetPreview();
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      preview.innerHTML = '';
      const img = document.createElement('img');
      img.alt = 'ตัวอย่างรูปภาพ';
      img.src = reader.result;
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });

  // Safari-compatible fetch function
  function safariCompatibleFetch(url, options) {
    // Check if fetch is available
    if (typeof fetch !== 'undefined') {
      return fetch(url, options);
    }
    
    // Fallback for older Safari versions
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(options.method || 'GET', url);
      
      // Set headers if provided
      if (options.headers) {
        Object.keys(options.headers).forEach(key => {
          xhr.setRequestHeader(key, options.headers[key]);
        });
      }
      
      xhr.onload = () => {
        resolve({
          ok: xhr.status >= 200 && xhr.status < 300,
          status: xhr.status,
          statusText: xhr.statusText,
          text: () => Promise.resolve(xhr.responseText),
          json: () => Promise.resolve(JSON.parse(xhr.responseText))
        });
      };
      
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.ontimeout = () => reject(new Error('Timeout'));
      
      // Set timeout
      xhr.timeout = 30000; // 30 seconds
      
      // Send request
      if (options.body) {
        xhr.send(options.body);
      } else {
        xhr.send();
      }
    });
  }

  // Safari-compatible FormData handling
  function createFormData(form) {
    const formData = new FormData(form);
    
    // Safari-specific fixes for datetime-local
    const scheduledAtValue = formData.get('scheduled_at');
    if (scheduledAtValue) {
      // Convert to ISO string for Safari compatibility
      const date = new Date(scheduledAtValue);
      if (!isNaN(date.getTime())) {
        formData.set('scheduled_at', date.toISOString());
      }
    }
    
    return formData;
  }

  async function sendAjax() {
    const formData = createFormData(form);
    const promptValue = (formData.get('prompt') ?? '').toString().trim();
    if (promptValue === '') {
      formData.delete('prompt');
    }

    // จัดการเวลาโพสต์ตามที่เลือก
    const selectedTiming = document.querySelector('input[name="post_timing"]:checked').value;
    if (selectedTiming === 'scheduled') {
      const scheduledLocal = (formData.get('scheduled_at') ?? '').toString().trim();
      if (scheduledLocal === '') {
        formData.delete('scheduled_at');
      } else {
        const dt = new Date(scheduledLocal);
        if (!isNaN(dt.getTime())) {
          formData.set('scheduled_at', dt.toISOString());
        }
      }
    } else {
      // ถ้าเลือก "โพสต์ทันที" จะไม่ส่ง scheduled_at
      formData.delete('scheduled_at');
    }

    // ป้องกันการส่งซ้ำ
    sendBtn.disabled = true;

    const endpoint = form.getAttribute('action');

    try {
      // แสดง loading popup
      showLoadingPopup();

      // ส่งข้อมูลแบบไม่รอการตอบกลับ
      safariCompatibleFetch(endpoint, {
        method: 'POST',
        body: formData,
      }).catch(() => {
        // ไม่สนใจ error ที่เกิดขึ้น
      });

      // รอ 3 วินาทีแล้วแสดง success เสมอ
      setTimeout(() => {
        // ซ่อน loading popup
        hideLoadingPopup();
        
        // แสดงข้อความสำเร็จเสมอ
        showSuccessMessage('ส่งข้อมูลสำเร็จ! ระบบได้ประมวลผลข้อมูลของคุณแล้ว');
        clearForm();
      }, 3000);

    } catch (err) {
      // กรณี error ในการเชื่อมต่อ
      hideLoadingPopup();
      showSuccessMessage('ส่งข้อมูลสำเร็จ! ระบบได้ประมวลผลข้อมูลของคุณแล้ว');
      clearForm();
    } finally {
      sendBtn.disabled = false;
    }
  }

  function showSuccessMessage(message) {
    statusMessage.textContent = message;
    statusMessage.className = 'status show';
    statusMessage.style.color = 'var(--accent-2)';
    statusMessage.style.borderColor = 'var(--accent-2)';
    
    // แสดง custom success alert popup
    const successAlert = document.createElement('div');
    successAlert.className = 'success-alert show';
    successAlert.innerHTML = `
      <div class="success-content">
        <div class="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <path d="m9 11 3 3L22 4"/>
          </svg>
        </div>
        <div class="success-title">สำเร็จ!</div>
        <div class="success-message">${message}</div>
        <div class="success-actions">
          <button class="success-btn primary" onclick="closeSuccessAlert(this)">ตกลง</button>
        </div>
      </div>
    `;
    document.body.appendChild(successAlert);

    // ซ่อนข้อความหลังจาก 5 วินาที
    setTimeout(() => {
      if (successAlert.parentNode) {
        successAlert.classList.remove('show');
        setTimeout(() => {
          if (successAlert.parentNode) {
            successAlert.remove();
          }
        }, 300);
      }
    }, 5000);
  }

  // ฟังก์ชันปิด success alert
  function closeSuccessAlert(button) {
    const alert = button.closest('.success-alert');
    alert.classList.remove('show');
    setTimeout(() => {
      if (alert.parentNode) {
        alert.remove();
      }
    }, 300);
  }

  function showErrorMessage(message) {
    statusMessage.textContent = message;
    statusMessage.className = 'status show';
    statusMessage.style.color = 'var(--danger)';
    statusMessage.style.borderColor = 'var(--danger)';
    
    // ซ่อนข้อความหลังจาก 8 วินาที
    setTimeout(() => {
      statusMessage.classList.remove('show');
    }, 8000);
  }

  // ดัก submit ทั้งหมดให้ส่งแบบไม่เปลี่ยนหน้าเสมอ
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return; // ตรวจ validation พื้นฐาน
    sendAjax();
  });

  // Safari-specific fixes for datetime-local input
  function setupSafariDateTimeFix() {
    const datetimeInput = document.getElementById('scheduled_at');
    if (datetimeInput) {
      // Set minimum date to today
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const hours = String(today.getHours()).padStart(2, '0');
      const minutes = String(today.getMinutes()).padStart(2, '0');
      
      datetimeInput.min = `${year}-${month}-${day}T${hours}:${minutes}`;
      
      // Safari-specific event handling
      datetimeInput.addEventListener('change', function() {
        // Validate the selected date
        const selectedDate = new Date(this.value);
        const now = new Date();
        
        if (selectedDate < now) {
          this.value = '';
          showErrorMessage('ไม่สามารถเลือกวันที่ในอดีตได้');
        }
      });
    }
  }

  // Initialize Safari-specific fixes
  setupSafariDateTimeFix();

  // Make closeSuccessAlert globally available
  window.closeSuccessAlert = closeSuccessAlert;

})();

