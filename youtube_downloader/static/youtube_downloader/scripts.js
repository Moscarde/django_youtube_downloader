document.addEventListener("DOMContentLoaded", function () {
    const videoTableBody = document.getElementById("video-table-body");
    const videoTableContainer = document.getElementById("video-table-container");

    // Função para atualizar a tabela de vídeos
    function updateVideoTable() {
        fetch("/videos")  // Rota criada para pegar os vídeos
            .then(response => response.json())
            .then(data => {
                // Limpa a tabela antes de atualizar os dados
                videoTableBody.innerHTML = '';

                if (data.length > 0) {
                    // Exibe a tabela suavemente
                    videoTableContainer.classList.add('show');
                    console.log('Tabela exibida');  // Log para verificar se a tabela está sendo exibida

                    // Preenche a tabela com os vídeos atualizados
                    data.forEach((video, index) => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <th scope="row">${index + 1}</th>
                            <td>${video.title}</td>
                            <td><a href="${video.url}" target="_blank">${video.url}</a></td>
                            <td>${video.status}</td>
                        `;
                        videoTableBody.appendChild(row);

                        // Aplica a classe de transição para suavizar a entrada das linhas
                        setTimeout(() => row.classList.add('show'), 10);
                    });
                } else {
                    // Caso não haja vídeos, mantém a tabela oculta
                    videoTableContainer.classList.remove('show');
                    console.log('Nenhum vídeo encontrado');  // Log para quando não houver vídeos
                }
            })
            .catch(error => console.error('Erro ao buscar vídeos:', error));
    }

    // Função de manipulação de envio do formulário
    function handleFormSubmit(event) {
        event.preventDefault(); // Impede o envio tradicional do formulário

        // Obtém a URL do vídeo do campo de input
        const videoUrl = document.querySelector("input[name='video_url']").value;

        // Verifica se a URL foi fornecida
        if (!videoUrl) {
            alert("Por favor, insira uma URL válida.");
            return;
        }

        const videoDownloadUrl = document.querySelector("#video-download-url").dataset.url;

        // Adiciona uma linha fake "Processando..." na tabela enquanto o backend processa
        const processingRow = document.createElement('tr');
        processingRow.classList.add('processing');
        processingRow.innerHTML = `
            <th scope="row">#</th>
            <td>Processando</td>
            <td>Processando</td>
            <td>Processando</td>
        `;
        // Insere a linha fake na primeira posição da tabela
        videoTableBody.insertBefore(processingRow, videoTableBody.firstChild);

        // Envia a solicitação AJAX
        fetch(videoDownloadUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value, // Inclui o token CSRF
            },
            body: JSON.stringify({ video_url: videoUrl }),
        })
            .then(response => response.json())
            .then(data => {
                document.querySelector("input[name='video_url']").value = ""; // Limpa o campo de input

                // Atualiza a tabela com os vídeos retornados
                // updateVideoTable();

                // Remover a linha "Processando" com efeito de fade
            })
            .catch(error => {
                console.error("Erro:", error);
                alert("Ocorreu um erro ao tentar enviar a solicitação.");
            });
    }

    // Adiciona o listener de evento no formulário
    const form = document.querySelector("form");
    if (form) {
        form.addEventListener("submit", handleFormSubmit);
    } else {
        console.error("Formulário não encontrado!");
    }

    // Atualiza a tabela a cada 5 segundos
    setInterval(updateVideoTable, 15000);

    // Chama a função de atualização ao carregar a página
    updateVideoTable();
});
