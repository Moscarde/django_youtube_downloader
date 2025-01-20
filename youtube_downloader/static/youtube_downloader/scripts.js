document.addEventListener("DOMContentLoaded", () => {
    const videoTableBody = document.getElementById("video-table-body");
    const videoTableContainer = document.getElementById("video-table-container");
    const spinner = document.querySelector("#loading-spinner");
    const form = document.querySelector("#video-form");
    const inputField = form?.querySelector("input[name='video_url']");
    const submitButton = form?.querySelector("button[type='submit']");
    const videoDownloadUrl = document.querySelector("#video-download-url")?.dataset.url;
    const csrfToken = document.querySelector("[name=csrfmiddlewaretoken]")?.value;

    let isEmpty = false;
    let lastFetchedData = null;

    const toggleSpinner = (show) => {
        spinner.classList.toggle("show", show);
        form.querySelectorAll("input, button").forEach(el => el.toggleAttribute("disabled", show));
    };

    const populateTable = (videos) => {

        const isDataIdentical = lastFetchedData && JSON.stringify(videos) === JSON.stringify(lastFetchedData);

        if (isDataIdentical) {
            console.log("Os dados são idênticos aos anteriores. Não será necessário atualizar a tabela.");
            return;
        }


        lastFetchedData = videos;

        videoTableBody.innerHTML = "";
        if (videos.length > 0) {
            videoTableContainer.classList.add("show");
            videos.forEach((video, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <th scope="row">${index + 1}</th>
                    <td>${video.title}</td>
                    <td><a href="${video.url}" target="_blank">${video.url}</a></td>
                    <td>${video.status}</td>
                `;
                videoTableBody.appendChild(row);
                setTimeout(() => row.classList.add("show"), 10);

                if (video.url.trim() === inputField.value.trim()) toggleSpinner(false);
            });
            isEmpty = false;
        } else {
            videoTableContainer.classList.remove("show");
            isEmpty = true;
        }
    };

    const updateVideoTable = () => {
        if (isEmpty) return;

        fetch("/videos")
            .then(response => response.json())
            .then(data => populateTable(data))
            .catch(error => console.error("Erro ao buscar vídeos:", error));
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();
        if (!inputField?.value) return alert("Por favor, insira uma URL válida.");
        toggleSpinner(true);

        fetch(videoDownloadUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify({ video_url: inputField.value }),
        })
            .then(response => response.json())
            .then(data => {
                isEmpty = false;

            })
            .catch(error => {
                console.error("Erro:", error);
                alert("Ocorreu um erro ao tentar enviar a solicitação.");
            });
    };

    form?.addEventListener("submit", handleFormSubmit);
    setInterval(updateVideoTable, 1000);
    updateVideoTable();
});
