document.addEventListener("DOMContentLoaded", function () {
    const videoTableBody = document.getElementById("video-table-body");
    const videoTableContainer = document.getElementById("video-table-container");
    const spinner = document.querySelector("#loading-spinner");
    const form = document.querySelector("#video-form");
    const inputField = form.querySelector("input[name='video_url']");
    const submitButton = form.querySelector("button[type='submit']");

    // Função para desbloquear o formulário e remover o spinner
    function unlockForm() {
        spinner.classList.remove("show"); // Remove o spinner
        form.querySelectorAll("input, button").forEach(el => el.removeAttribute("disabled")); // Desbloqueia
    }

    // Função para atualizar a tabela de vídeos
    function updateVideoTable() {
        fetch("/videos") // Rota criada para pegar os vídeos
            .then(response => response.json())
            .then(data => {
                console.log("Vídeos:", data);
                // Limpa a tabela antes de atualizar os dados
                videoTableBody.innerHTML = "";

                if (data.length > 0) {
                    // Exibe a tabela suavemente
                    videoTableContainer.classList.add("show");
                    console.log("Tabela exibida");

                    // Preenche a tabela com os vídeos atualizados
                    data.forEach((video, index) => {
                        const row = document.createElement("tr");
                        row.innerHTML = `
                            <th scope="row">${index + 1}</th>
                            <td>${video.title}</td>
                            <td><a href="${video.url}" target="_blank">${video.url}</a></td>
                            <td>${video.status}</td>
                        `;
                        videoTableBody.appendChild(row);

                        // Aplica a classe de transição para suavizar a entrada das linhas
                        setTimeout(() => row.classList.add("show"), 10);

                        // Verifica se a URL do vídeo na tabela é similar à fornecida no input
                        if (video.url.trim() === inputField.value.trim()) {
                            console.log("URL encontrada na tabela. Desbloqueando formulário...");
                            unlockForm(); // Desbloqueia o formulário
                        }
                    });
                } else {
                    // Caso não haja vídeos, mantém a tabela oculta
                    videoTableContainer.classList.remove("show");
                    console.log("Nenhum vídeo encontrado");
                }
            })
            .catch(error => console.error("Erro ao buscar vídeos:", error));
    }

    // Função para lidar com o envio do formulário
    function handleFormSubmit(event) {
        event.preventDefault(); // Impede o envio tradicional do formulário

        // Obtém a URL do vídeo do campo de input
        const videoUrl = inputField.value;

        // Verifica se a URL foi fornecida
        if (!videoUrl) {
            alert("Por favor, insira uma URL válida.");
            return;
        }

        // Exibe o spinner
        spinner.classList.add("show");

        // Bloqueia o formulário e exibe o spinner com animação
        form.querySelectorAll("input, button").forEach(el => el.setAttribute("disabled", "true"));

        const videoDownloadUrl = document.querySelector("#video-download-url").dataset.url;

        // Envia a solicitação AJAX
        fetch(videoDownloadUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value, // Inclui o token CSRF
            },
            body: JSON.stringify({ video_url: videoUrl }),
        })
            .then(response => response.json())
            .then(data => {
                console.log("Resposta:", data);
            })
            .catch(error => {
                console.error("Erro:", error);
                alert("Ocorreu um erro ao tentar enviar a solicitação.");
            });
    }

    // Adiciona o listener de evento no formulário
    if (form) {
        form.addEventListener("submit", handleFormSubmit);
    } else {
        console.error("Formulário não encontrado!");
    }

    // Atualiza a tabela a cada 15 segundos
    setInterval(updateVideoTable, 15000);

    // Chama a função de atualização ao carregar a página
    updateVideoTable();
});