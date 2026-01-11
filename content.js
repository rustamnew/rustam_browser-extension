// Content script for Ozon.ru
// Hide elements with data-index="2" class="tile-root" containing "Помочь" or "Помощь"

const keywords = [
    'Помочь', 
    'Помощь', 
    'Благотворительный сертификат'
];

function hideElements() {
    const elements = document.querySelectorAll('div[data-index].tile-root');
    elements.forEach(element => {
        // Пропускаем, если уже скрыт через inline стиль
        if (element.style.visibility === 'hidden') {
            return;
        }

        const text = element.innerText || element.textContent;
        if (keywords.some(keyword => text.includes(keyword))) {
            console.log('Hiding element:', text.trim().substring(0, 50));
            element.style.visibility = 'hidden';
        }
    });
}

// Run on page load
document.addEventListener('DOMContentLoaded', hideElements);

// Also observe for dynamic content
const observer = new MutationObserver(hideElements);
observer.observe(document.body, { childList: true, subtree: true });

// Repeat hideElements every 2 seconds
// setInterval(hideElements, 2000);