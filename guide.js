const pageLanguage = document.documentElement.lang === 'en' ? 'en' : 'ko';
localStorage.setItem('lang', pageLanguage);

function applyTheme(theme) {
    if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', theme);
    document.getElementById('themeToggle').textContent = theme === 'light'
        ? (pageLanguage === 'ko' ? '다크 모드' : 'Dark mode')
        : (pageLanguage === 'ko' ? '라이트 모드' : 'Light mode');
}

const savedTheme = localStorage.getItem('theme');
applyTheme(savedTheme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
document.getElementById('themeToggle').addEventListener('click', () => {
    applyTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
});
document.getElementById('langToggle').addEventListener('click', () => {
    const otherLanguage = pageLanguage === 'ko' ? 'en' : 'ko';
    localStorage.setItem('lang', otherLanguage);
    location.href = document.getElementById('langToggle').dataset.otherUrl;
});
