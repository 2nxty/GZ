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
        linkText.style.color = '#e0e0e0';

        const downloadButton = document.createElement('button');
        downloadButton.innerHTML = '<i class="bi bi-arrow-right"></i>';
        downloadButton.className = 'item-button';
        downloadButton.onclick = () => window.open(uri, '_blank');

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

// Função para criar um modal com texto simples
function createTextModal(title, message, onConfirm) {
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

    const messageText = document.createElement('p');
    messageText.textContent = message;
    messageText.style.marginBottom = '20px';

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `display: flex; justify-content: flex-end; gap: 10px;`;

    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'CONFIRM';
    confirmButton.className = 'confirmation-button';
    confirmButton.onclick = () => {
        document.body.removeChild(modal); // Fecha o modal
        if (onConfirm && typeof onConfirm === 'function') {
            onConfirm(); // Executa a função personalizada, se fornecida
        }
    };

    const closeButton = document.createElement('button');
    closeButton.textContent = 'CLOSE';
    closeButton.className = 'clos-button';
    closeButton.onclick = () => document.body.removeChild(modal);

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
        let fileSizeText = `${item.sourceName} | ${item.fileSize}`; // Adiciona o name antes do fileSize
        if (isMagnetOnly) {
            fileSizeText += ' | Torrent';
        } else if (isMagnetWithOthers || isMultipleHttp) {
            fileSizeText += ' | Multiple hosts';
        } else if (isSingleHttp) {
            fileSizeText += ' | Direct link';
        }
        const li = document.createElement('li');
        li.className = 'result-item';
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
        
        // Calcula o delay baseado na posição relativa dentro do lote
        const delay = (index - startIndex) * 0.1; // 0.1s de delay por item
        li.style.animation = `slideIn 0.5s ease ${delay}s forwards`; // Define a animação imediatamente
        
        const button = li.querySelector('.item-button');
        button.onclick = () => {
            if (item.uris.length > 1) {
                createModal(item.title, item.uris);
            } else {
                window.open(item.uris[0], '_blank');
            }
        };
        resultList.appendChild(li);
    }
}

// Função para criar a lista de resultados com carregamento dinâmico na página inteira
function renderList(items) {
    const resultList = document.querySelector('.result-list');
    const container = document.querySelector('.container');
    
    // Remove o listener de rolagem anterior, se existir
    if (window.scrollListener) {
        window.removeEventListener('scroll', window.scrollListener);
    }

    resultList.innerHTML = '';
    if (items.length > 0) {
        resultList.style.display = 'block';
        container.classList.add('active');

        let loadedCount = 0;
        const batchSize = 10; // Quantidade de itens a carregar por vez após os primeiros 100
        const initialLoad = Math.min(30, items.length); // Carrega até 30 inicialmente

        // Carrega os primeiros 100 resultados
        loadResults(items, 0, initialLoad);
        loadedCount = initialLoad;

        // Configura o evento de rolagem na janela
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
        window.scrollListener = scrollHandler; // Armazena para remoção posterior
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
            const dateA = a.uploadDate ? new Date(a.uploadDate) : new Date(0); // Fallback para epoch se não houver data
            const dateB = b.uploadDate ? new Date(b.uploadDate) : new Date(0);
            return dateB - dateA; // Ordem decrescente (mais recente primeiro)
        });
    renderList(filtered);
}

// Função para carregar múltiplos arquivos JSON com timeout
async function loadJsonData() {
    const jsonUrls = [
        'https://raw.githubusercontent.com/srtmd/cnx/refs/heads/main/docs/gz.json',
        'https://raw.githubusercontent.com/Shisuiicaro/source/refs/heads/main/shisuyssource.json',
        'https://davidkazumi.github.io/fontekazumi.json',
        'https://hydralinks.cloud/sources/steamrip-software.json',
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
                Promise.race([
                    fetch(url, { signal: AbortSignal.timeout(5000) }) // Timeout de 5 segundos
                        .then(res => {
                            if (!res.ok) {
                                console.warn(`Failed to load ${url}: ${res.status}`);
                                return null; // Retorna null para 404 ou outros erros
                            }
                            return res.json();
                        })
                        .catch(err => {
                            console.warn(`Error fetching ${url}: ${err.message}`);
                            return null; // Retorna null para timeout ou outros erros
                        }),
                    new Promise(resolve => setTimeout(() => resolve(null), 5000)) // Garante null se demorar demais
                ])
            )
        );

        const allData = responses
            .filter(data => data !== null) // Remove respostas nulas (falhas)
            .reduce((acc, data) => {
                if (data.downloads && Array.isArray(data.downloads)) {
                    // Adiciona o "name" do JSON a cada item de downloads
                    const downloadsWithSource = data.downloads.map(download => ({
                        ...download,
                        sourceName: data.name || 'Unknown Source' // Fallback se "name" não existir
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
    // Função para obter o parâmetro "game" da URL
    function getQueryParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // Obtém o valor do parâmetro "game"
    const gameValue = getQueryParam("game");

    if (gameValue) {
        const searchBar = document.querySelector(".search-bar");

        if (searchBar) {
            searchBar.value = gameValue;

            // Aguarde um pequeno tempo antes de acionar o clique
            setTimeout(() => {
                const searchButton = document.querySelector(".search-button");
                if (searchButton) {
                    searchButton.click();
                }
            }, 1000); // 1 segundo de delay para garantir que o input seja processado
        }
    }
});

// Chamar a função quando a página carregar
window.onload = loadJsonData;