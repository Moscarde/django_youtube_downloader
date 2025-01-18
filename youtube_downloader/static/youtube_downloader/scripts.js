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