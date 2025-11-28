// Trang chi tiết phim
document.addEventListener('DOMContentLoaded', () => {
  // Bảo vệ đăng nhập giống dashboard
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (isLoggedIn !== 'true') {
    window.location.href = 'login.html';
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const movieId = params.get('id');

  if (!movieId) {
    showError('Không tìm thấy ID phim trong đường dẫn.');
    return;
  }

  loadMovieDetails(movieId);
});

const TMDB_API_KEY = '0addaaf398dea3a2df1d4f9087ba6ce6';
const TMDB_BASE = 'https://api.themoviedb.org/3';

async function loadMovieDetails(id) {
  try {
    const res = await fetch(
      `${TMDB_BASE}/movie/${id}?api_key=${TMDB_API_KEY}&language=vi-VN&append_to_response=credits`
    );

    if (!res.ok) {
      throw new Error('HTTP ' + res.status);
    }

    const data = await res.json();
    renderMovie(data);
  } catch (err) {
    console.error('Lỗi khi tải chi tiết phim:', err);
    showError('Không thể tải thông tin phim.');
  }
}

function renderMovie(movie) {
  const shell = document.getElementById('movieShell');
  if (shell) {
    shell.classList.remove('loading');
  }

  const titleEl = document.getElementById('movieTitle');
  const taglineEl = document.getElementById('movieTagline');
  const statusLabel = document.getElementById('movieStatusLabel');
  const metaEl = document.getElementById('movieMeta');
  const ratingEl = document.getElementById('movieRating');
  const genresEl = document.getElementById('movieGenres');
  const overviewEl = document.getElementById('movieOverview');
  const posterEl = document.getElementById('moviePoster');
  const langEl = document.getElementById('movieLanguage');
  const budgetEl = document.getElementById('movieBudget');
  const revenueEl = document.getElementById('movieRevenue');
  const linkEl = document.getElementById('movieTmdbLink');

  if (titleEl) {
    titleEl.textContent = movie.title || movie.name || 'Không có tiêu đề';
    document.title = `${titleEl.textContent} - Phim Của Tôi`;
  }

  if (statusLabel) {
    statusLabel.textContent = movie.status || 'Chi tiết phim';
  }

  if (taglineEl) {
    taglineEl.textContent = movie.tagline || '';
  }

  if (posterEl) {
    const posterUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : 'https://via.placeholder.com/500x750?text=No+Poster';
    posterEl.src = posterUrl;
    posterEl.alt = movie.title || 'Poster phim';
  }

  if (metaEl) {
    const year = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
    const runtime =
      typeof movie.runtime === 'number' && movie.runtime > 0
        ? `${movie.runtime} phút`
        : 'Đang cập nhật';
    const country =
      Array.isArray(movie.production_countries) &&
      movie.production_countries.length
        ? movie.production_countries[0].name
        : '—';

    metaEl.innerHTML = '';
    [year, runtime, country].forEach((val) => {
      const span = document.createElement('span');
      span.textContent = val;
      metaEl.appendChild(span);
    });
  }

  if (ratingEl) {
    const score =
      typeof movie.vote_average === 'number'
        ? movie.vote_average.toFixed(1)
        : 'N/A';
    const count = movie.vote_count || 0;
    ratingEl.innerHTML = `
      <span class="rating-pill">⭐ ${score}/10</span>
      <span>${count.toLocaleString('vi-VN')} lượt đánh giá</span>
    `;
  }

  if (genresEl) {
    genresEl.innerHTML = '';
    if (Array.isArray(movie.genres) && movie.genres.length) {
      movie.genres.forEach((g) => {
        const chip = document.createElement('span');
        chip.className = 'genre-chip';
        chip.textContent = g.name;
        genresEl.appendChild(chip);
      });
    }
  }

  if (overviewEl) {
    overviewEl.textContent =
      movie.overview && movie.overview.trim().length
        ? movie.overview
        : 'Hiện chưa có mô tả cho bộ phim này.';
  }

  // Cast
  const castContainer = document.getElementById('movieCast');
  const castSection = document.getElementById('castSection');
  if (castContainer && castSection) {
    castContainer.innerHTML = '';
    const cast =
      movie.credits && Array.isArray(movie.credits.cast)
        ? movie.credits.cast.slice(0, 8)
        : [];

    if (!cast.length) {
      castSection.classList.add('hidden');
    } else {
      cast.forEach((person) => {
        const card = document.createElement('div');
        card.className = 'cast-card';
        card.innerHTML = `
          <p class="cast-name">${person.name || 'Không rõ'}</p>
          <p class="cast-role">${
            person.character ? 'vai ' + person.character : ''
          }</p>
        `;
        castContainer.appendChild(card);
      });
    }
  }

  // Extra
  if (langEl) {
    langEl.textContent = movie.original_language
      ? movie.original_language.toUpperCase()
      : '—';
  }
  if (budgetEl) {
    budgetEl.textContent =
      typeof movie.budget === 'number' && movie.budget > 0
        ? movie.budget.toLocaleString('vi-VN') + ' $'
        : '—';
  }
  if (revenueEl) {
    revenueEl.textContent =
      typeof movie.revenue === 'number' && movie.revenue > 0
        ? movie.revenue.toLocaleString('vi-VN') + ' $'
        : '—';
  }
  if (linkEl && movie.id) {
    linkEl.href = `https://www.themoviedb.org/movie/${movie.id}`;
  }
}

function showError(message) {
  const errorEl = document.getElementById('movieError');
  if (errorEl) {
    errorEl.classList.remove('hidden');
    const p = errorEl.querySelector('p');
    if (p && message) {
      p.textContent = message;
    }
  }
}


