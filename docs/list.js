// Função para formatar o texto do link no modal
function formatLinkText(uri) {
    if (uri.startsWith('magnet')) {
        return 'Magnet';
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
        const icon = uri.startsWith('magnet') ? '<i class="bi bi-magnet"></i>' : '<i class="bi bi-box-arrow-up-right"></i>';
        linkText.innerHTML = `${icon}<span style="margin-left: 10px;">${formatLinkText(uri)}</span>`;
        linkText.style.color = '#e0e0e0'; // Texto em branco

        const downloadButton = document.createElement('button');
        downloadButton.innerHTML = '<i class="bi bi-arrow-right"></i>';
        downloadButton.className = 'item-button'; // Reutiliza o estilo do botão da lista
        downloadButton.onclick = () => window.open(uri, '_blank'); // Abre o link em nova aba

        li.appendChild(linkText);
        li.appendChild(downloadButton);
        linkList.appendChild(li);
    });

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `display: flex; justify-content: flex-end;`;

    const closeButton = document.createElement('button');
    closeButton.textContent = 'CLOSE';
    closeButton.className = 'clos-button';
    closeButton.onclick = () => document.body.removeChild(modal);

    buttonContainer.appendChild(closeButton);
    modalContent.appendChild(modalTitle);
    modalContent.appendChild(linkList);
    modalContent.appendChild(buttonContainer);
    modal.appendChild(modalContent);

    document.body.appendChild(modal);
}

// Função para criar a lista de resultados
function renderList(items) {
    const resultList = document.querySelector('.result-list');
    const container = document.querySelector('.container');
    
    resultList.innerHTML = '';
    if (items.length > 0) {
        if (items.length > 500) {
            const confirmModal = document.createElement('div');
            confirmModal.style.cssText = `
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
            modalTitle.textContent = '⚠️ Large result list';
            modalTitle.style.marginBottom = '15px';

            const message = document.createElement('p');
            message.textContent = `Your search returned ${items.length} results. Loading this many items may slow down performance. Do you want to proceed?`;
            message.style.marginBottom = '5px';

            const messages = document.createElement('p');
            messages.textContent = `Clicking NO will only show the first 500 results.`;
            messages.style.marginBottom = '10px';

            const buttonContainer = document.createElement('div');
            buttonContainer.style.cssText = `display: flex; justify-content: flex-end; gap: 10px;`;

            const confirmButton = document.createElement('button');
            confirmButton.textContent = 'YES, Load all results';
            confirmButton.className = 'confirmation-button';
            confirmButton.onclick = () => {
                document.body.removeChild(confirmModal);
                loadResults(items);
            };

            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'NO';
            cancelButton.className = 'clos-button';
            cancelButton.onclick = () => {
                document.body.removeChild(confirmModal);
                loadResults(items.slice(0, 500)); // Carrega apenas os primeiros 500 itens
            };

            buttonContainer.appendChild(confirmButton);
            buttonContainer.appendChild(cancelButton);
            modalContent.appendChild(modalTitle);
            modalContent.appendChild(message);
            modalContent.appendChild(messages);
            modalContent.appendChild(buttonContainer);
            confirmModal.appendChild(modalContent);
            document.body.appendChild(confirmModal);
        } else {
            loadResults(items);
        }
    } else {
        resultList.style.display = 'none';
        container.classList.remove('active');
    }
}

// Função auxiliar para carregar os resultados
function loadResults(items) {
    const resultList = document.querySelector('.result-list');
    const container = document.querySelector('.container');
    
    resultList.style.display = 'block';
    container.classList.add('active');
    items.forEach((item, index) => {
        const magnetLinks = item.uris.filter(uri => uri.startsWith('magnet'));
        const isMagnetOnly = magnetLinks.length === 1 && item.uris.length === 1;
        const isMagnetWithOthers = magnetLinks.length > 0 && item.uris.length > 1;
        const isMultipleHttp = item.uris.filter(uri => uri.startsWith('http')).length > 1;
        const isSingleHttp = item.uris.length === 1 && item.uris[0].startsWith('http');
        let fileSizeText = item.fileSize;
        if (isMagnetOnly) {
            fileSizeText += ' - Torrent';
        } else if (isMagnetWithOthers || isMultipleHttp) {
            fileSizeText += ' - Multiple hosts';
        } else if (isSingleHttp) {
            fileSizeText += ' - Direct link';
        }
        const li = document.createElement('li');
        li.className = 'result-item';
        li.style.animationDelay = `${0.1 * (index + 1)}s`;
        li.innerHTML = `
            <div class="item-info">
                ${isMagnetOnly ? '<i class="bi bi-magnet"></i>' : isSingleHttp ? '<i class="bi bi-box-arrow-up-right"></i>' : '<i class="bi bi-folder-plus"></i>'}
                <div>
                    <span class="item-name">${item.title}</span>
                    <br>
                    <span style="font-size: 14px; color: #b0b0b0;">
                        ${fileSizeText}
                    </span>
                </div>
            </div>
            <button class="item-button"><i class="bi bi-arrow-right"></i></button>
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
                fetch(url)
                    .then(res => {
                        if (!res.ok) {
                            console.warn(`Failed to load ${url}: ${res.status}`);
                            return null; // Retorna null para URLs com erro
                        }
                        return res.json();
                    })
                    .catch(err => {
                        console.warn(`Error fetching ${url}: ${err.message}`);
                        return null; // Retorna null em caso de erro
                    })
            )
        );

        // Filtra os resultados nulos e combina os downloads válidos
        const allData = responses
            .filter(data => data !== null) // Remove os que falharam
            .reduce((acc, data) => {
                if (data.downloads && Array.isArray(data.downloads)) {
                    return acc.concat(data.downloads);
                }
                return acc;
            }, []);

        // Se nenhum JSON foi carregado com sucesso, exibe erro
        if (allData.length === 0) {
            throw new Error('No valid data loaded from any source');
        }

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
        resultList.innerHTML = `Error loading data: ${error.message}`;
        resultList.style.display = 'block';
        console.error('Error loading JSON:', error);
    }
}

// Chamar a função quando a página carregar
window.onload = loadJsonData;