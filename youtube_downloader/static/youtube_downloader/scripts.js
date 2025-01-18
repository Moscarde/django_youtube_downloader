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
            alert(data.message); // Exibe a mensagem de sucesso
            document.querySelector("input[name='video_url']").value = ""; // Limpa o campo de input
        })
        .catch(error => {
            console.error("Erro:", error);
            alert("Ocorreu um erro ao tentar enviar a solicitação.");
        });
}

document.addEventListener("DOMContentLoaded", function() {
    const videoTableBody = document.querySelector("tbody");

    // Função para atualizar a tabela de vídeos
    function updateVideoTable() {
        fetch("/videos")  // Rota criada para pegar os vídeos
            .then(response => response.json())
            .then(data => {
                // Limpa a tabela
                videoTableBody.innerHTML = '';

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
            })
            .catch(error => console.error('Erro ao buscar vídeos:', error));
    }

    // Atualizar a tabela a cada 5 segundos
    setInterval(updateVideoTable, 5000);
});