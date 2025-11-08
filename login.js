// Xử lý form đăng nhập
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    
    // Kiểm tra nếu đã đăng nhập
    if (localStorage.getItem('isLoggedIn') === 'true') {
        // Redirect đến dashboard hoặc trang chính
        window.location.href = 'dashboard.html';
    }
    
    // Hiển thị thông báo đăng ký thành công nếu có
    if (window.location.search.includes('registered=true')) {
        const successDiv = document.createElement('div');
        successDiv.className = 'alert alert-success';
        successDiv.textContent = 'Đăng ký thành công! Vui lòng đăng nhập.';
        loginForm.insertBefore(successDiv, loginForm.firstChild);
        
        // Tự động xóa query string
        setTimeout(() => {
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 3000);
    }
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Ẩn thông báo lỗi cũ
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
        
        // Validate
        if (!email || !password) {
            showError('Vui lòng điền đầy đủ thông tin!');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('Email không hợp lệ!');
            return;
        }
        
        // Validate password (tối thiểu 6 ký tự)
        if (password.length < 6) {
            showError('Mật khẩu phải có ít nhất 6 ký tự!');
            return;
        }
        
        try {
            // TODO: Thay thế bằng API call thật
            // const response = await fetch('YOUR_API_ENDPOINT/login', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({ email, password })
            // });
            // const data = await response.json();
            
            // Tạm thời kiểm tra với localStorage (danh sách users đã đăng ký)
            const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const user = registeredUsers.find(u => u.email === email && u.password === password);
            
            if (!user) {
                showError('Email hoặc mật khẩu không đúng!');
                return;
            }
            
            // Lưu thông tin người dùng (trong thực tế, API sẽ trả về token/userInfo)
            const userData = {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                loginTime: new Date().toISOString(),
                rememberMe: rememberMe
            };
            
            // Lưu vào localStorage
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userData', JSON.stringify(userData));
            
            if (rememberMe) {
                // Có thể lưu thêm thông tin để nhớ lâu hơn
                localStorage.setItem('rememberedUser', email);
            }
            
            // Redirect đến dashboard
            window.location.href = 'dashboard.html';
            
        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            showError('Đăng nhập thất bại. Vui lòng thử lại!');
        }
    });
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
    
    // Điền email đã lưu nếu có
    const rememberedEmail = localStorage.getItem('rememberedUser');
    if (rememberedEmail) {
        document.getElementById('email').value = rememberedEmail;
        document.getElementById('rememberMe').checked = true;
    }
});
