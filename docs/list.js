// Função para formatar o texto do link no modal
function formatLinkText(uri) {
    if (uri.startsWith('magnet')) {
        return 'Torrent';
    } else if (uri.startsWith('http')) {
        const url = new URL(uri);
        return `${url.hostname}`;
    }
    return uri; // Fallback para outros casos
}

// Função para criar o modal
function createModal(title, uris) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: rgba(20, 40, 40, 0.7);
        backdrop-filter: blur(15px);
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.1);
        animation: fadeIn 0.5s ease;
        max-width: 500px;
        width: 90%;
        color: #e0e0e0;
    `;

    const modalTitle = document.createElement('h3');
    modalTitle.textContent = title;
    modalTitle.style.marginBottom = '15px';

    const linkList = document.createElement('ul');
    linkList.style.cssText = `
        list-style: none;
        padding: 0;
    `;

    uris.forEach(uri => {
        const li = document.createElement('li');
        li.className = 'result-li';
        const linkText = document.createElement('span');
        linkText.textContent = formatLinkText(uri);
        linkText.style.color = '#fff'; // Texto em branco

        const downloadButton = document.createElement('a');
        downloadButton.href = uri;
        downloadButton.target = '_blank';
        downloadButton.innerHTML = '<i class="bi bi-download"></i>';
        downloadButton.className = 'item-button'; // Reutiliza o estilo do botão da lista

        li.appendChild(linkText);
        li.appendChild(downloadButton);
        linkList.appendChild(li);
    });

    const closeButton = document.createElement('button');
    closeButton.textContent = 'CLOSE';
    closeButton.className = 'clos-button';
    closeButton.onclick = () => document.body.removeChild(modal);

    modalContent.appendChild(modalTitle);
    modalContent.appendChild(linkList);
    modalContent.appendChild(closeButton);
    modal.appendChild(modalContent);

    document.body.appendChild(modal);
}

// Função para criar a lista de resultados
function renderList(items) {
    const resultList = document.querySelector('.result-list');
    const container = document.querySelector('.container');
    
    resultList.innerHTML = '';
    if (items.length > 0) {
        resultList.style.display = 'block';
        container.classList.add('active');
        items.forEach((item, index) => {
            const isMagnet = item.uris.some(uri => uri.startsWith('magnet'));
            const isMultipleHttp = item.uris.filter(uri => uri.startsWith('http')).length > 1;
            const isHttp = item.uris.some(uri => uri.startsWith('http'));
            let fileSizeText = item.fileSize;
            if (isMagnet) {
                fileSizeText += ' - Torrent';
            } else if (isMultipleHttp) {
                fileSizeText += ' - Multiple hosts';
            } else if (isHttp) {
                fileSizeText += ' - Direct link';
            }
            const li = document.createElement('li');
            li.className = 'result-item';
            li.style.animationDelay = `${0.1 * (index + 1)}s`;
            li.innerHTML = `
                <div class="item-info">
                    <img src="${item.image || 'https://placehold.co/50x50'}" alt="${item.title}" class="item-image">
                    <div>
                        <span class="item-name">${item.title}</span>
                        <br>
                        <span style="font-size: 14px; color: #b0b0b0;">
                            ${fileSizeText}
                        </span>
                    </div>
                </div>
                <button class="item-button"><i class="bi bi-download"></i></button>
            `;
            const button = li.querySelector('.item-button');
            button.onclick = () => {
                if (item.uris.length > 1) {
                    createModal(item.title, item.uris);
                } else {
                    window.open(item.uris[0], '_blank');
                }
            };
            resultList.appendChild(li);
        });
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
    const filtered = allData.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    renderList(filtered);
}

// Função para carregar múltiplos arquivos JSON
async function loadJsonData() {
    const jsonUrls = [
        'https://gamesz.one/gz.json',
        'https://raw.githubusercontent.com/Shisuiicaro/source/refs/heads/main/shisuyssource.json',
        'https://davidkazumi.github.io/fontekazumi.json',
        'https://hydralinks.cloud/sources/onlinefix.json',
        'https://hydralinks.cloud/sources/xatab.json',
        'https://hydralinks.cloud/sources/kaoskrew.json',
        'https://hydralinks.cloud/sources/gog.json',
        'https://hydralinks.cloud/sources/atop-games.json',
        'https://hydralinks.cloud/sources/dodi.json',
        'https://hydralinks.cloud/sources/fitgirl.json',
        // Adicione mais URLs conforme necessário
    ];

    try {
        const responses = await Promise.all(
            jsonUrls.map(url => 
                fetch(url).then(res => {
                    if (!res.ok) throw new Error(`Erro ao carregar ${url}: ${res.status}`);
                    return res.json();
                })
            )
        );

        // Combina todos os downloads em uma única array
        const allData = responses.reduce((acc, data) => {
            if (data.downloads && Array.isArray(data.downloads)) {
                return acc.concat(data.downloads);
            }
            return acc;
        }, []);

        // Configurar eventos de busca
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

        // Inicialmente esconder a lista
        renderList([]);
    } catch (error) {
        const resultList = document.querySelector('.result-list');
        resultList.innerHTML = `Erro ao carregar os dados: ${error.message}`;
        resultList.style.display = 'block';
        console.error('Erro ao carregar JSON:', error);
    }
}

// Chamar a função quando a página carregar
window.onload = loadJsonData;