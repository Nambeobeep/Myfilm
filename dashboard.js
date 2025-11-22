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
        const displayName = userData.fullName || 'Khách';
        if (userNameElement) {
            userNameElement.textContent = displayName;
        }
        const sidebarUserElement = document.getElementById('sidebarUser');
        if (sidebarUserElement) {
            sidebarUserElement.textContent = displayName;
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

    setupGenreFilters();
    setupRefreshActions();
    setupInfiniteScroll();

    function logout() {
        // Xóa tất cả thông tin khỏi localStorage
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userData');
        localStorage.removeItem('rememberedUser');
        
        // Redirect về trang login
        window.location.href = 'login.html';
    }
});

// Nếu muốn dùng TMDB API, sử dụng format sau:
const TMDB_API_KEY = '0addaaf398dea3a2df1d4f9087ba6ce6';
const FILMS_API = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}`;

// Biến lưu trữ tất cả phim và thể loại hiện tại
let allFilms = [];
let currentGenre = 'all';
let currentPage = 1;
let totalPages = null;
let isLoadingMovies = false;
let infiniteObserver = null;

window.onload = function() {
	loadFilms({ reset: true });
};

async function loadFilms({ reset = false } = {}) {
	if (isLoadingMovies) return;
	if (!reset && totalPages && currentPage > totalPages) {
		updateInfiniteMessage('Bạn đã xem hết rồi!');
		return;
	}

	if (reset) {
		currentPage = 1;
		totalPages = null;
		allFilms = [];
		const movieListElement = document.getElementById('movieList');
		if (movieListElement) {
			movieListElement.innerHTML = '<p>Đang tải phim...</p>';
		}
	}

	const pageToFetch = currentPage;
	isLoadingMovies = true;
	toggleInfiniteSpinner(true);
	updateInfiniteMessage('');

	try {
		// Báo cho người dùng biết đang tải dữ liệu
		const response = await fetch(`${FILMS_API}&page=${pageToFetch}`);
		
		// response.ok = true khi HTTP status trong khoảng 200-299
		if (!response.ok) {
			throw new Error('HTTP error! status: ' + (response && response.status != null ? response.status : 'unknown'));
		}
		
		// Chuyển phản hồi thành JSON (mảng các phim)
		const data = await response.json();
		
		// Lưu tất cả phim vào biến allFilms (TMDB trả về object với trường `results`)
		const fetchedMovies = Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : []);
		totalPages = data.total_pages || totalPages;
		if (reset) {
			allFilms = fetchedMovies;
		} else {
			allFilms = [...allFilms, ...fetchedMovies];
		}
		
		// Hiển thị phim gợi ý trong sidebar
		renderSidebarMovies(allFilms);
		
		// Hiển thị danh sách phim dựa trên bộ lọc hiện tại
		applyFilter();

		currentPage = pageToFetch + 1;
		const reachedEnd = totalPages && currentPage > totalPages;
		updateInfiniteMessage(reachedEnd ? 'Bạn đã xem hết rồi!' : '');
	} catch (error) {
		// Nếu fetch lỗi mạng / CORS / API down sẽ vào đây
		console.error('Lỗi khi tải dữ liệu:', error);
		updateInfiniteMessage('Không thể tải dữ liệu từ API.');
		const movieListElement = document.getElementById('movieList');
		if (movieListElement && reset) {
			movieListElement.innerHTML = '<p style="color: red;">Không thể tải dữ liệu từ API. Lỗi: ' + error.message + '</p>';
		}
	} finally {
		isLoadingMovies = false;
		toggleInfiniteSpinner(false);
	}
}

// Hàm lấy phim ngẫu nhiên
function getRandomMovies(movies, count) {
	if (!movies || movies.length === 0) return [];
	const shuffled = [...movies].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, count);
}

// Hàm hiển thị phim ở sidebar mới
function renderSidebarMovies(allMovies) {
	if (!allMovies || allMovies.length === 0) return;

	const featuredContainer = document.getElementById('featuredMovies');
	if (!featuredContainer) return;

	const highlights = getRandomMovies(allMovies, 3);
	featuredContainer.innerHTML = highlights.map(phim => createFeaturedMovieCard(phim)).join('');
}

// Hàm tạo movie card cho sidebar
function createFeaturedMovieCard(phim) {
	const posterUrl = phim.poster_path 
		? `https://image.tmdb.org/t/p/w500${phim.poster_path}` 
		: 'https://via.placeholder.com/500x750?text=No+Poster';
	const releaseYear = phim.release_date ? phim.release_date.split('-')[0] : 'N/A';
	const rating = phim.vote_average ? phim.vote_average.toFixed(1) : 'N/A';
	
	return `
		<article class="featured-card">
			<img src="${posterUrl}" alt="${phim.title || 'Không có tiêu đề'}"
				 onerror="this.src='https://via.placeholder.com/500x750?text=No+Image'">
			<div class="featured-info">
				<h5>${phim.title || 'Không có tiêu đề'}</h5>
				<div class="featured-meta">${releaseYear} • IMDb ${rating}/10</div>
				<span class="featured-tag">⭐ ${rating}</span>
			</div>
		</article>
	`;
}

function applyFilter() {
	if (!allFilms || allFilms.length === 0) {
		console.warn('Chưa có dữ liệu phim để lọc');
		return;
	}
	let filtered = allFilms;
	if (currentGenre !== 'all') {
		const genreId = Number(currentGenre);
		filtered = allFilms.filter(p => Array.isArray(p.genre_ids) && p.genre_ids.includes(genreId));
		if (filtered.length === 0) {
			console.info('Không có phim trùng thể loại, hiển thị toàn bộ');
			filtered = allFilms;
		}
	}
	renderFilms(filtered);
}

function renderFilms(films) {
	if (!films || !Array.isArray(films) || films.length === 0) {
		const movieListElement = document.getElementById('movieList');
		if (movieListElement) {
			movieListElement.innerHTML = '<p>Không có phim nào để hiển thị.</p>';
		}
		return;
	}
	
	// Dùng map() để tạo HTML cho từng phim, sau đó join() để nối thành chuỗi
	const html = films.map(phim => {
		// Tạo URL bìa phim từ TMDB API
		const posterUrl = phim.poster_path 
			? `https://image.tmdb.org/t/p/w500${phim.poster_path}` 
			: 'https://via.placeholder.com/500x750?text=No+Poster';
		
		return `
		<div class="movie-card">
			<img src="${posterUrl}" alt="${phim.title || 'Không có tiêu đề'}" 
				 onerror="this.src='https://via.placeholder.com/500x750?text=No+Image'">
			<h3>${phim.title || 'Không có tiêu đề'}</h3>
			<p><strong>Năm:</strong> ${phim.release_date ? phim.release_date.split('-')[0] : 'N/A'}</p>
			<p><strong>Điểm:</strong> ${phim.vote_average ? phim.vote_average.toFixed(1) : 'N/A'}/10</p>
			<p><strong>Mô tả:</strong> ${phim.overview ? (phim.overview.length > 100 ? phim.overview.substring(0, 100) + '...' : phim.overview) : 'Không có mô tả'}</p>
		</div>
		`;
	}).join('');
	
	// Gắn chuỗi HTML vào thẻ hiển thị danh sách phim
	const movieListElement = document.getElementById('movieList');
	if (movieListElement) {
		movieListElement.innerHTML = html;
	} else {
		console.error('Không tìm thấy element với id="movieList"');
	}
}

function setupGenreFilters() {
	const filterChips = document.querySelectorAll('.filter-chip');
	if (!filterChips.length) return;

	filterChips.forEach(chip => {
		chip.addEventListener('click', () => {
			currentGenre = chip.dataset.genre || 'all';
			updateActiveFilter(chip);
			applyFilter();
		});
	});

	// Đảm bảo trạng thái mặc định
	updateActiveFilter(document.querySelector(`.filter-chip[data-genre="${currentGenre}"]`));
}

function updateActiveFilter(activeChip) {
	const filterChips = document.querySelectorAll('.filter-chip');
	filterChips.forEach(chip => chip.classList.remove('active'));
	if (activeChip) {
		activeChip.classList.add('active');
	}
}

function setupRefreshActions() {
	const refreshFeaturedBtn = document.getElementById('refreshFeatured');
	const shuffleBtn = document.getElementById('shuffleHighlights');
	const refreshMoviesBtn = document.getElementById('refreshMovies');

	const refreshHighlights = () => {
		if (!allFilms.length) return;
		renderSidebarMovies(allFilms);
	};

	if (refreshFeaturedBtn) {
		refreshFeaturedBtn.addEventListener('click', refreshHighlights);
	}
	if (shuffleBtn) {
		shuffleBtn.addEventListener('click', refreshHighlights);
	}
	if (refreshMoviesBtn) {
		refreshMoviesBtn.addEventListener('click', () => loadFilms({ reset: true }));
	}
}

function setupInfiniteScroll() {
	const sentinel = document.getElementById('infiniteSentinel');
	if (!sentinel) return;

	if (infiniteObserver) {
		infiniteObserver.disconnect();
	}

	infiniteObserver = new IntersectionObserver(entries => {
		const entry = entries[0];
		if (entry && entry.isIntersecting) {
			loadFilms();
		}
	}, {
		rootMargin: '300px',
		threshold: 0
	});

	infiniteObserver.observe(sentinel);
}

function toggleInfiniteSpinner(show) {
	const spinner = document.getElementById('infiniteSpinner');
	if (!spinner) return;
	if (show) {
		spinner.classList.remove('hidden');
		spinner.classList.add('visible');
	} else {
		spinner.classList.add('hidden');
		spinner.classList.remove('visible');
	}
}

function updateInfiniteMessage(message) {
	const messageElement = document.getElementById('infiniteMessage');
	if (messageElement) {
		messageElement.textContent = message || '';
	}
}

const searchInput = document.getElementById("search-input");
const results = document.getElementById("search-results");

searchInput.addEventListener("keyup", function () {
  const query = searchInput.value.trim();

  if (query.length < 2) {
    results.innerHTML = "";
    return;
  }

  fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${query}`)
    .then(res => res.json())
    .then(data => {
      results.innerHTML = ""; 

      data.results.forEach(movie => {
        const card = document.createElement("a");
        card.href = `movie.html?id=${movie.id}`;
        card.className = "movie-card";

        card.innerHTML = `
          <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" />
          <h3>${movie.title}</h3>
        `;

        results.appendChild(card);
      });
    });
});
