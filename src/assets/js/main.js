document.addEventListener('DOMContentLoaded', () => {
    const toc = document.querySelector('.sidebar');
    const openBtn = document.querySelector('.tocToggleBtn');
    const closeBtns = document.querySelectorAll('.tocCloseBtn');
    const scrollToTopBtn = document.querySelector('.scrollToTop');
    const layout = document.querySelector('.appLayout');
    const menuLinks = document.querySelectorAll('ul.navList.tableOfContent li a.link');
    const scrollThreshold = 1000;

    scrollToTopBtn.hidden = true;

    const toggleMenu = (isOpen) => {
        if (isOpen) {
            toc.classList.add('isOpen');
            layout.classList.add('tocOpen');
            document.body.style.overflow = 'hidden';

            if (openBtn) { openBtn.hidden = true;}
            closeBtns.forEach(btn => btn.hidden = false);

        } else {
            toc.classList.remove('isOpen');
            layout.classList.remove('tocOpen');
            document.body.style.overflow = '';

            if (openBtn) {
                openBtn.hidden = false;
                openBtn.focus();
            }
            closeBtns.forEach(btn => btn.hidden = true);
        }
    };

    scrollToTopBtn.addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));

    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            toggleMenu(false);
        });
    });

    if (!toc.classList.contains('isOpen')) {
        if (openBtn) openBtn.hidden = false;
        closeBtns.forEach(btn => btn.hidden = true);
    }
    if (openBtn) openBtn.addEventListener('click', () => toggleMenu(true));
    closeBtns.forEach(btn => btn.addEventListener('click', () => toggleMenu(false)));

    layout.addEventListener('click', (e) => {
        if (e.target === layout && toc && toc.classList.contains('isOpen')) {
            toggleMenu(false);
        }
    });

    window.addEventListener('scroll', function() {
        if (window.scrollY <= scrollThreshold) {
            scrollToTopBtn.hidden = true;
        } else {
            scrollToTopBtn.hidden = false;
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && toc && toc.classList.contains('isOpen')) {
            toggleMenu(false);
        }
    });
});