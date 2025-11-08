// Xử lý dashboard và đăng xuất
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra nếu chưa đăng nhập thì redirect về trang login
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // Lấy thông tin người dùng
    const userDataStr = localStorage.getItem('userData');
    if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        // Hiển thị tên người dùng
        const userNameElement = document.getElementById('userName');
        if (userNameElement && userData.fullName) {
            userNameElement.textContent = userData.fullName;
        }
    }

    // Xử lý nút đăng xuất
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Xác nhận đăng xuất
            if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                logout();
            }
        });
    }

    function logout() {
        // Xóa tất cả thông tin khỏi localStorage
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userData');
        localStorage.removeItem('rememberedUser');
        
        // Redirect về trang login
        window.location.href = 'login.html';
    }
});
