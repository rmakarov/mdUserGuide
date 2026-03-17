/**
 * DocsApp — простое приложение для документации
 * Загружает JSON с контентом и рендерит страницу
 */
class DocsApp {
    constructor() {
        this.currentLang = 'ru';
        this.data = null;
        this.contentContainer = null;

        this.init();
    }

    async init() {
        this.contentContainer = document.getElementById('contentContainer');

        // Определяем язык из URL или localStorage
        const urlParams = new URLSearchParams(window.location.search);
        this.currentLang = urlParams.get('lang') || localStorage.getItem('docsLang') || 'ru';

        await this.loadData();
        this.renderMenu();
        this.renderContent();
        this.setupEventListeners();

        // Плавный скролл к секции, если есть хеш в URL
        if (window.location.hash) {
            setTimeout(() => {
                const targetId = window.location.hash.slice(1);
                document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }

    async loadData() {
        try {
            const response = await fetch(`data-${this.currentLang}.json`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            this.data = await response.json();

            // Устанавливаем заголовок страницы
            document.title = this.data.meta?.title || 'Документация';

            // Устанавливаем язык для HTML и сохраняем в localStorage
            document.documentElement.lang = this.currentLang;
            localStorage.setItem('docsLang', this.currentLang);

        } catch (e) {
            console.error('Ошибка загрузки данных:', e);
            if (this.contentContainer) {
                this.contentContainer.innerHTML = `
                    <div class="content-section error">
                        <h1>⚠️ Ошибка загрузки</h1>
                        <p>Не удалось загрузить данные для языка "${this.currentLang}".</p>
                        <p><a href="?lang=${this.currentLang === 'ru' ? 'en' : 'ru'}">
                            Попробовать другой язык
                        </a></p>
                    </div>
                `;
            }
        }
    }

    renderMenu() {
        const menuEl = document.getElementById('navMenu');
        if (!menuEl || !this.data?.menu) return;

        menuEl.innerHTML = this.data.menu.map(item =>
            `<li><a class="nav-item" href="#${item.id}">${item.title}</a></li>`
        ).join('');

        // Обновляем активную кнопку языка
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
        });
    }

    renderContent() {
        if (!this.contentContainer || !this.data?.content) return;

        // Вставляем весь контент (секции уже имеют id из build.js)
        this.contentContainer.innerHTML = Object.values(this.data.content).join('');
    }

    setupEventListeners() {
        // Переключение языка
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const newLang = e.target.dataset.lang;
                if (newLang !== this.currentLang) {
                    // Перезагружаем с новым языком, сохраняя хеш если есть
                    const hash = window.location.hash;
                    window.location.search = `lang=${newLang}${hash}`;
                }
            });
        });

        // Мобильное меню: кнопка открытия/закрытия
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');

        menuToggle?.addEventListener('click', () => {
            sidebar?.classList.toggle('open');
        });

        // Закрытие меню при клике на ссылку (мобильные)
        document.getElementById('navMenu')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-item') && window.innerWidth <= 768) {
                sidebar?.classList.remove('open');
            }
        });

        // Закрытие меню при клике вне его (мобильные)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 &&
                sidebar?.classList.contains('open') &&
                !sidebar.contains(e.target) &&
                !menuToggle?.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });

        // Плавный скролл для якорных ссылок (дополнительная совместимость)
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', function(e) {
                const targetId = this.hash.slice(1);
                const target = document.getElementById(targetId);

                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });

                    // Обновляем хеш без прокрутки
                    history.pushState(null, null, this.hash);
                }
            });
        });

        // Обработка кнопок "Назад/Вперёд" браузера
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1);
            if (hash) {
                document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    new DocsApp();
});