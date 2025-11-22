// form đăng ký
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordStrength = document.getElementById('passwordStrength');
    const passwordMatch = document.getElementById('passwordMatch');
    
    // Kiểm tra nếu đã đăng nhập
    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'dashboard.html';
    }
    
    // Kiểm tra độ mạnh mật khẩu
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = checkPasswordStrength(password);
        passwordStrength.textContent = strength.text;
        passwordStrength.className = 'password-strength ' + strength.class;
    });
    
    // Kiểm tra khớp mật khẩu
    confirmPasswordInput.addEventListener('input', function() {
        const password = passwordInput.value;
        const confirmPassword = this.value;
        
        if (confirmPassword.length === 0) {
            passwordMatch.textContent = '';
            passwordMatch.className = 'password-match';
            confirmPasswordInput.classList.remove('is-valid', 'is-invalid');
            return;
        }
        
        if (password === confirmPassword) {
            passwordMatch.textContent = '✓ Mật khẩu khớp';
            passwordMatch.className = 'password-match match';
            confirmPasswordInput.classList.remove('is-invalid');
            confirmPasswordInput.classList.add('is-valid');
        } else {
            passwordMatch.textContent = '✗ Mật khẩu không khớp';
            passwordMatch.className = 'password-match no-match';
            confirmPasswordInput.classList.remove('is-valid');
            confirmPasswordInput.classList.add('is-invalid');
        }
    });
    
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Ẩn thông báo cũ
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';
        errorMessage.textContent = '';
        successMessage.textContent = '';
        
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        // Validate đầy đủ thông tin
        if (!fullName || !email || !phone || !password || !confirmPassword) {
            showError('Vui lòng điền đầy đủ thông tin!');
            return;
        }
        
        // Validate tên (tối thiểu 2 ký tự)
        if (fullName.length < 2) {
            showError('Họ và tên phải có ít nhất 2 ký tự!');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('Email không hợp lệ!');
            return;
        }
        
        // Validate số điện thoại (10-11 số)
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(phone)) {
            showError('Số điện thoại không hợp lệ! (10-11 số)');
            return;
        }
        
        // Validate mật khẩu (tối thiểu 6 ký tự)
        if (password.length < 6) {
            showError('Mật khẩu phải có ít nhất 6 ký tự!');
            return;
        }
        
        // Validate mật khẩu khớp
        if (password !== confirmPassword) {
            showError('Mật khẩu xác nhận không khớp!');
            return;
        }
        
        // Validate đồng ý điều khoản
        if (!agreeTerms) {
            showError('Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật!');
            return;
        }
        

        const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const userExists = existingUsers.find(user => user.email === email);
        
        if (userExists) {
            showError('Email này đã được sử dụng! Vui lòng đăng nhập hoặc sử dụng email khác.');
            return;
        }
        
        try {
            // TODO: Thay thế bằng API call thật
            // const response = await fetch('YOUR_API_ENDPOINT/register', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({
            //         fullName,
            //         email,
            //         phone,
            //         password
            //     })
            // });
            // const data = await response.json();
            
            // Tạm thời lưu vào localStorage
            const userData = {
                id: Date.now(),
                fullName: fullName,
                email: email,
                phone: phone,
                password: password, 
                registeredAt: new Date().toISOString()
            };
            
            existingUsers.push(userData);
            localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
            

            successMessage.textContent = 'Đăng ký thành công! Đang chuyển đến trang đăng nhập...';
            successMessage.style.display = 'block';
            

            setTimeout(() => {
                window.location.href = 'login.html?registered=true';
            }, 2000);
            
        } catch (error) {
            console.error('Lỗi đăng ký:', error);
            showError('Đăng ký thất bại. Vui lòng thử lại!');
        }
    });
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
    
    function checkPasswordStrength(password) {
        if (password.length === 0) {
            return { text: '', class: '' };
        }
        
        let strength = 0;
        
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        
        if (strength <= 2) {
            return { text: 'Độ mạnh: Yếu', class: 'weak' };
        } else if (strength <= 3) {
            return { text: 'Độ mạnh: Trung bình', class: 'medium' };
        } else {
            return { text: 'Độ mạnh: Mạnh', class: 'strong' };
        }
    }
});
