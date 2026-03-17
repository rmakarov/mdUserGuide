const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');

const md = new MarkdownIt({ html: true, linkify: true });
const CONTENT_DIR = './src/content';
const DIST_DIR = './dist';

// Конфигурация структуры меню (порядок файлов)
const MENU_STRUCTURE = [
    { id: 'intro', title: { ru: 'Введение', en: 'Introduction' } },
    { id: 'setup', title: { ru: 'Установка', en: 'Setup' } },
    { id: 'api', title: { ru: 'API', en: 'API Reference' } }
];

function build() {
    if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR);

    const languages = ['ru', 'en'];

    languages.forEach(lang => {
        const langDir = path.join(CONTENT_DIR, lang);
        const data = {
            lang,
            menu: [],
            content: {}
        };

        // Проходим по структуре меню и загружаем контент
        MENU_STRUCTURE.forEach(item => {
            const filePath = path.join(langDir, `${item.id}.md`);
            let htmlContent = '<p>Content not found</p>';

            if (fs.existsSync(filePath)) {
                const markdown = fs.readFileSync(filePath, 'utf-8');
                htmlContent = md.render(markdown);
            }

            // Записываем в меню и контент
            data.menu.push({
                id: item.id,
                title: item.title[lang]
            });
            data.content[item.id] = htmlContent;
        });

        // Сохраняем JSON
        fs.writeFileSync(
            path.join(DIST_DIR, `data-${lang}.json`),
            JSON.stringify(data, null, 2)
        );
        console.log(`✓ Сгенерировано data-${lang}.json`);
    });

    // Копируем index.html
    fs.copyFileSync('./src/template/index.html', path.join(DIST_DIR, 'index.html'));
    console.log('✓ Скопирован index.html');
}

build();

