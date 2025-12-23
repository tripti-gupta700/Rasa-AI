export const renderMarkdown = (text: string) => {
    let html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br />');

    if (html.includes('•')) {
        const listItems = html.split('<br />').map(line => {
            if (line.trim().startsWith('•')) {
                return `<li>${line.trim().substring(1).trim()}</li>`;
            }
            return line;
        }).join('');
        
        html = listItems.replace(/(<li>.*?<\/li>)+/g, (match) => `<ul class="list-disc list-inside space-y-1">${match}</ul>`);
    }

    return { __html: html };
};

export const getCurrentSeason = (): string => {
    const month = new Date().getMonth(); // 0-11
    // Simplistic Northern Hemisphere seasons
    if (month >= 2 && month <= 4) return 'Spring'; // March, April, May
    if (month >= 5 && month <= 7) return 'Summer'; // June, July, August
    if (month >= 8 && month <= 10) return 'Autumn'; // September, October, November
    return 'Winter'; // December, January, February
};
