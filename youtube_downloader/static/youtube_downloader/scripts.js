document.addEventListener("DOMContentLoaded", function () {
    const videoTableBody = document.getElementById("video-table-body");
    const videoTableContainer = document.getElementById("video-table-container");

    // Função para atualizar a tabela de vídeos
    function updateVideoTable() {
        fetch("/videos")  // Rota criada para pegar os vídeos
            .then(response => response.json())
            .then(data => {
                // Limpa a tabela
                videoTableBody.innerHTML = '';

                if (data.length > 0) {
                    // Se houver vídeos, exibe a tabela
                    videoTableContainer.style.display = 'block';

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
                    });
                } else {
                    // Caso não haja vídeos, mantém a tabela oculta
                    videoTableContainer.style.display = 'none';
                }
            })
            .catch(error => console.error('Erro ao buscar vídeos:', error));
    }

    // Atualizar a tabela a cada 5 segundos
    setInterval(updateVideoTable, 15000);

    // Chama a função de atualização ao carregar a página
    updateVideoTable();

    // Função de manipulação de envio do formulário
    const form = document.getElementById("video-form");

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
        processingRow.innerHTML = `
            <th scope="row">#</th>
            <td>Processando</td>
            <td><a href="${videoUrl}" target="_blank">${videoUrl}</a></td>
            <td>Processando</td>
        `;
        // videoTableBody.innerHTML = ''; // Limpa a tabela antes de adicionar a linha fake
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
            })
            .catch(error => {
                console.error("Erro:", error);
                alert("Ocorreu um erro ao tentar enviar a solicitação.");
            });
    }

    // Verifica se o formulário foi encontrado e adiciona o evento
    if (form) {
        form.addEventListener("submit", handleFormSubmit);
    } else {
        console.error("Formulário não encontrado!");
    }
});
