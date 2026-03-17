const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');

const md = new MarkdownIt({ html: true, linkify: true });
const SRC_DIR = './src';
const DIST_DIR = './dist';

// Структура меню
const MENU_STRUCTURE = [
    { id: 'intro', title: { ru: 'Введение', en: 'Introduction' } },
    { id: 'setup', title: { ru: 'Установка', en: 'Setup' } },
    { id: 'api', title: { ru: 'API', en: 'API Reference' } }
];

// Рекурсивное копирование папки
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
            console.log(`✓ Скопирован ${entry.name}`);
        }
    }
}

function build() {
    // Создаём dist
    if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR);

    const languages = ['ru', 'en'];

    languages.forEach(lang => {
        const langDir = path.join(SRC_DIR, 'content', lang);
        const data = {
            lang,
            meta: {
                title: lang === 'ru' ? 'Моя Документация' : 'My Documentation',
                description: lang === 'ru' ? 'Документация проекта' : 'Project Documentation'
            },
            menu: [],
            content: {}
        };

        MENU_STRUCTURE.forEach(item => {
            const filePath = path.join(langDir, `${item.id}.md`);
            let htmlContent = '<p>Content not found</p>';

            if (fs.existsSync(filePath)) {
                const markdown = fs.readFileSync(filePath, 'utf-8');
                // Оборачиваем в div с id для якорных ссылок
                htmlContent = `<div id="${item.id}" class="content-section">${md.render(markdown)}</div>`;
            }

            data.menu.push({
                id: item.id,
                title: item.title[lang]
            });
            data.content[item.id] = htmlContent;
        });

        fs.writeFileSync(
            path.join(DIST_DIR, `data-${lang}.json`),
            JSON.stringify(data, null, 2)
        );
        console.log(`✓ Сгенерировано data-${lang}.json`);
    });

    // Копируем HTML шаблон
    fs.copyFileSync(
        path.join(SRC_DIR, 'template', 'index.html'),
        path.join(DIST_DIR, 'index.html')
    );
    console.log('✓ Скопирован index.html');

    // === Копируем статику (CSS и JS) ===
    copyDir(path.join(SRC_DIR, 'assets'), DIST_DIR);

    console.log('\n✅ Сборка завершена!');
}

build();