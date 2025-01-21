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
    let intervalTime = 1000;
    let intervalId = null;
    let isAwaitingResponse = false;
    let videoProcessingId = null;

    const toggleSpinner = (show) => {
        spinner.classList.toggle("show", show);
        form.querySelectorAll("input, button").forEach(el => el.toggleAttribute("disabled", show));
    };

    const populateTable = (videos) => {
        const isDataIdentical = lastFetchedData && JSON.stringify(videos) === JSON.stringify(lastFetchedData);
        if (isDataIdentical) return;

        lastFetchedData = videos;
        videoTableBody.innerHTML = "";

        let hasPending = false;

        if (videos.length > 0) {
            videoTableContainer.classList.add("show");
            videos.forEach((video, index) => {
                console.log(video)
                if (video.status === "Pendente" && videoProcessingId === null) {
                    videoProcessingId = video.id;
                }

                if (["Pendente", "Baixado", "Excluído"].includes(video.status)) {
                    hasPending = true;
                }

                const row = createTableRow(video, index);
                videoTableBody.appendChild(row);
                setTimeout(() => row.classList.add("show"), 10);

                if (video.url.trim() === inputField.value.trim()) toggleSpinner(false);
            });

            intervalTime = hasPending && videoProcessingId !== null ? 1000 : 10000;
            isEmpty = false;
        } else {
            videoTableContainer.classList.remove("show");
            isEmpty = true;
        }

        clearInterval(intervalId);
        intervalId = setInterval(updateVideoTable, intervalTime);
    };

    const createTableRow = (video, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <th scope="row">${index + 1}</th>
            <td><img class="img-thumb" src="${video.thumbnail_url}"></td>
            <td>${video.title}</td>
            <td>
                <p><strong>Canal:</strong> ${video.uploader}</p>
                <p><strong>Views:</strong> ${video.views}</p>
            </td>
            <td><a href="${video.url}" target="_blank">${video.url}</a></td>
            <td>${video.status}</td>
        `;
        return row;
    };

    const updateVideoTable = () => {
        if (isEmpty || isAwaitingResponse) return;

        fetch("/videos")
            .then(response => response.json())
            .then(data => {
                populateTable(data);

                if (!data.some(video => video.status === "Pendente") && videoProcessingId !== null) {
                    intervalTime = 10000;
                    clearInterval(intervalId);
                    intervalId = setInterval(updateVideoTable, intervalTime);
                    videoProcessingId = null;
                }
            })
            .catch(error => console.error("Erro ao buscar vídeos:", error));
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();
        if (!inputField?.value) return alert("Por favor, insira uma URL válida.");

        toggleSpinner(true);
        isAwaitingResponse = true;
        intervalTime = 1000;
        clearInterval(intervalId);
        intervalId = setInterval(updateVideoTable, intervalTime);

        fetch(videoDownloadUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify({ video_url: inputField.value }),
        })
            .then(response => response.json())
            .then(() => {
                isEmpty = false;
                isAwaitingResponse = false;
                updateVideoTable();
            })
            .catch(error => {
                console.error("Erro:", error);
                alert("Ocorreu um erro ao tentar enviar a solicitação.");
                isAwaitingResponse = false;
            });
    };

    form?.addEventListener("submit", handleFormSubmit);

    intervalId = setInterval(updateVideoTable, intervalTime);
    updateVideoTable();
});
