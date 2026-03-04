// Função para formatar o texto do link no modal
function formatLinkText(uri) {
    if (uri.startsWith('magnet')) {
        return 'Magnet';
    } else if (uri.startsWith('http')) {
        const url = new URL(uri);
        return url.hostname.replace(/^www\./, '');
    }
    return uri;
}

// Função para criar o modal
function createModal(title, uris) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-box';

    const modalTitle = document.createElement('h3');
    modalTitle.className = 'modal-title';
    modalTitle.textContent = title;

    const linkList = document.createElement('ul');
    linkList.className = 'modal-links';

    uris.forEach(uri => {
        const li = document.createElement('li');
        li.className = 'result-li';

        const linkText = document.createElement('span');
        const icon = uri.startsWith('magnet') ? '<i class="bi bi-magnet"></i>' : '<i class="bi bi-box-arrow-up-right"></i>';
        linkText.innerHTML = `${icon}<span style="margin-left: 10px;">${formatLinkText(uri)}</span>`;

        const downloadButton = document.createElement('button');
        downloadButton.innerHTML = '<i class="bi bi-arrow-right"></i>';
        downloadButton.className = 'item-button';

        const open = () => window.open(uri, '_blank');
        downloadButton.onclick = open;

        // Make the entire row clickable
        li.style.cursor = 'pointer';
        li.onclick = (e) => {
            if (e.target !== downloadButton && !downloadButton.contains(e.target)) {
                open();
            }
        };

        li.appendChild(linkText);
        li.appendChild(downloadButton);
        linkList.appendChild(li);
    });

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'modal-actions';

    const closeButton = document.createElement('button');
    closeButton.textContent = 'CLOSE';
    closeButton.className = 'clos-button';
    closeButton.onclick = () => document.body.removeChild(modal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) document.body.removeChild(modal);
    });

    buttonContainer.appendChild(closeButton);
    modalContent.appendChild(modalTitle);
    modalContent.appendChild(linkList);
    modalContent.appendChild(buttonContainer);
    modal.appendChild(modalContent);

    document.body.appendChild(modal);
}

// Função para criar um modal com texto simples
function createTextModal(title, message, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-box';

    const modalTitle = document.createElement('h3');
    modalTitle.className = 'modal-title';
    modalTitle.textContent = title;

    const messageText = document.createElement('p');
    messageText.textContent = message;
    messageText.style.cssText = 'font-family:var(--mono);font-size:12px;color:var(--muted);margin-bottom:24px;line-height:1.7;';

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'modal-actions';

    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'CONFIRM';
    confirmButton.className = 'confirmation-button';
    confirmButton.onclick = () => {
        document.body.removeChild(modal);
        if (onConfirm && typeof onConfirm === 'function') {
            onConfirm();
        }
    };

    const closeButton = document.createElement('button');
    closeButton.textContent = 'CLOSE';
    closeButton.className = 'clos-button';
    closeButton.onclick = () => document.body.removeChild(modal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) document.body.removeChild(modal);
    });

    buttonContainer.appendChild(confirmButton);
    buttonContainer.appendChild(closeButton);
    modalContent.appendChild(modalTitle);
    modalContent.appendChild(messageText);
    modalContent.appendChild(buttonContainer);
    modal.appendChild(modalContent);

    document.body.appendChild(modal);
}

// Função para carregar itens na lista
function loadResults(items, startIndex, count) {
    const resultList = document.querySelector('.result-list');
    const endIndex = Math.min(startIndex + count, items.length);
    
    for (let index = startIndex; index < endIndex; index++) {
        const item = items[index];
        const magnetLinks = item.uris.filter(uri => uri.startsWith('magnet'));
        const isMagnetOnly = magnetLinks.length === 1 && item.uris.length === 1;
        const isMagnetWithOthers = magnetLinks.length > 0 && item.uris.length > 1;
        const isMultipleHttp = item.uris.filter(uri => uri.startsWith('http')).length > 1;
        const isSingleHttp = item.uris.length === 1 && item.uris[0].startsWith('http');

        let hostLabel;
        if (isMagnetOnly)                          hostLabel = 'TORRENT';
        else if (isMagnetWithOthers || isMultipleHttp) hostLabel = 'MULTI-HOST';
        else if (isSingleHttp) {
            try { hostLabel = new URL(item.uris[0]).hostname.replace(/^www\./, '').toUpperCase(); }
            catch(e) { hostLabel = 'DIRECT'; }
        } else { hostLabel = 'LINK'; }

        const li = document.createElement('li');
        li.className = 'result-item';
        li.innerHTML = `
            <div class="item-info">
                <span class="item-name">${item.title}</span>
                <span class="item-meta">${(item.sourceName || '').toUpperCase()} &nbsp;·&nbsp; ${item.fileSize || ''} &nbsp;·&nbsp; ${hostLabel}</span>
            </div>
            <button class="item-button"><i class="bi bi-arrow-right"></i></button>
        `;

        const delay = (index - startIndex) * 0.06;
        li.style.animationDelay = `${delay}s`;

        const button = li.querySelector('.item-button');
        const open = () => {
            if (item.uris.length > 1) {
                createModal(item.title, item.uris);
            } else {
                window.open(item.uris[0], '_blank');
            }
        };
        button.onclick = open;

        li.style.cursor = 'pointer';
        li.onclick = (e) => {
            if (e.target !== button && !button.contains(e.target)) open();
        };

        resultList.appendChild(li);
    }
}

// Função para criar a lista de resultados com carregamento dinâmico
function renderList(items) {
    const resultList = document.querySelector('.result-list');
    const container = document.querySelector('.container');
    
    if (window.scrollListener) {
        window.removeEventListener('scroll', window.scrollListener);
    }

    resultList.innerHTML = '';
    if (items.length > 0) {
        resultList.style.display = 'block';
        container.classList.add('active');

        let loadedCount = 0;
        const batchSize = 10;
        const initialLoad = Math.min(30, items.length);

        loadResults(items, 0, initialLoad);
        loadedCount = initialLoad;

        const scrollHandler = () => {
            const scrollPosition = window.scrollY + window.innerHeight;
            const pageHeight = document.documentElement.scrollHeight;
            if (pageHeight - scrollPosition < 200 && loadedCount < items.length) {
                const nextBatch = Math.min(batchSize, items.length - loadedCount);
                loadResults(items, loadedCount, nextBatch);
                loadedCount += nextBatch;
            }
        };

        window.addEventListener('scroll', scrollHandler);
        window.scrollListener = scrollHandler;
    } else {
        resultList.style.display = 'none';
        container.classList.remove('active');
    }
}

// Função para filtrar os itens
function filterItems(searchTerm, allData) {
    if (!searchTerm) {
        renderList([]);
        return;
    }
    const filtered = allData
        .filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            const dateA = a.uploadDate ? new Date(a.uploadDate) : new Date(0);
            const dateB = b.uploadDate ? new Date(b.uploadDate) : new Date(0);
            return dateB - dateA;
        });
    renderList(filtered);
}

// Função para carregar múltiplos arquivos JSON com timeout
async function loadJsonData() {
    const jsonUrls = [
        'https://raw.githubusercontent.com/srtmd/cnx/refs/heads/main/docs/gz.json',
        'https://raw.githubusercontent.com/Shisuiicaro/source/refs/heads/main/shisuyssource.json',
        'https://davidkazumi-github-io.pages.dev/fontekazumi.json',
        'https://hydralinks.pages.dev/sources/onlinefix.json',
        'https://hydralinks.pages.dev/sources/xatab.json',
        'https://hydralinks.pages.dev/sources/kaoskrew.json',
        'https://hydralinks.pages.dev/sources/gog.json',
        'https://hydralinks.pages.dev/sources/atop-games.json',
        'https://raw.githubusercontent.com/Wkeynhk/Rutor/refs/heads/main/rutor.json',
        'https://hydralinks.pages.dev/sources/dodi.json',
        'https://hydralinks.pages.dev/sources/fitgirl.json',
        'https://hydralinks.pages.dev/sources/steamrip.json',
        'https://raw.githubusercontent.com/Wkeynhk/Rutor/refs/heads/main/steamgg.json',
        'https://hydralinks.pages.dev/sources/rexagames.json',
        'https://hydralinks.pages.dev/sources/tinyrepacks.json'
    ];

    try {
        const responses = await Promise.all(
            jsonUrls.map(url =>
                Promise.race([
                    fetch(url, { signal: AbortSignal.timeout(5000) })
                        .then(res => {
                            if (!res.ok) {
                                console.warn(`Failed to load ${url}: ${res.status}`);
                                return null;
                            }
                            return res.json();
                        })
                        .catch(err => {
                            console.warn(`Error fetching ${url}: ${err.message}`);
                            return null;
                        }),
                    new Promise(resolve => setTimeout(() => resolve(null), 5000))
                ])
            )
        );

        const allData = responses
            .filter(data => data !== null)
            .reduce((acc, data) => {
                if (data.downloads && Array.isArray(data.downloads)) {
                    const downloadsWithSource = data.downloads.map(download => ({
                        ...download,
                        sourceName: data.name || 'Unknown Source'
                    }));
                    return acc.concat(downloadsWithSource);
                }
                return acc;
            }, []);

        if (allData.length === 0) {
            throw new Error('No valid data loaded from any source');
        }

        const searchBar = document.querySelector('.search-bar');
        const searchButton = document.querySelector('.search-button');

        searchButton.addEventListener('click', () => {
            const searchTerm = searchBar.value.trim();
            filterItems(searchTerm, allData);
        });

        searchBar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = searchBar.value.trim();
                filterItems(searchTerm, allData);
            }
        });

        renderList([]);
    } catch (error) {
        const resultList = document.querySelector('.result-list');
        resultList.innerHTML = `Error loading data: ${error.message}`;
        resultList.style.display = 'block';
        console.error('Error loading JSON:', error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    function getQueryParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    const gameValue = getQueryParam("game");

    if (gameValue) {
        const searchBar = document.querySelector(".search-bar");
        if (searchBar) {
            searchBar.value = gameValue;
            setTimeout(() => {
                const searchButton = document.querySelector(".search-button");
                if (searchButton) searchButton.click();
            }, 1000);
        }
    }
});

window.onload = loadJsonData;