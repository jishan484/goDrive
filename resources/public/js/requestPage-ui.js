function loadSharedFile() {
    let params = location.pathname.split("/");
    let datas = {
        tokenId: params[params.length - 1]
    }
    $.ajax({
        url: "/external/v1/request/" + location.pathname.split("/").pop(),
        type: "GET",
        data: datas,
        success: (data, text) => {
            renderFiles(data.data[0]);
        }
    });
}

function renderFiles(requestInfo) {
    let html = `
                                <div class="container-xxl flex-grow-1 container-p-y">
                                    <div class="row g-6">
                                        <div class="col-6 mb-2">
                                            <label class="form-label text-reset">File Name</label>
                                            <input type="text" value="${requestInfo.fileName}" class="form-control"
                                                readonly>
                                        </div>
                                        <div class="col-6 mb-2">
                                            <label class="form-label text-reset">File Requester</label>
                                            <input type="text" value="${requestInfo.requester}" class="form-control"
                                                readonly>
                                        </div>
                                        <div class="col-12 mb-2">
                                            <label class="form-label text-reset">File Description</label>
                                            <input type="text" value="${requestInfo.description}"
                                                placeholder="No Description provided" class="form-control" readonly>
                                        </div>

                                        <div class="col-12 mb-2">
                                            <label class="form-label text-reset">Upload File</label>
                                            <div class="card">
                                                <div class="card-body">
                                                    <div id="file-drop-area" class="drop-area">
                                                        <p>Drag & Drop files here</p>
                                                        <input type="file" id="file-upload-input" class="form-control"/>
                                                    </div>
                                                    <div id="file-upload-preview"></div>
                                                    <button class="btn btn-outline-primary share-icon m-0">Upload</button>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
    `;

    $('#requestedFileDetails').html(html);
}
loadSharedFile();





// Elements
const dropArea = document.getElementById('file-drop-area');
const fileInput = document.getElementById('file-upload-input');

// When a file is dropped
dropArea.addEventListener('drop', function (e) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files[0]);
});

// When a file is dragged over the drop area
dropArea.addEventListener('dragover', function (e) {
    e.preventDefault();
    dropArea.style.backgroundColor = '#e2e6ea';
});

// When a drag leaves the drop area
dropArea.addEventListener('dragleave', function () {
    dropArea.style.backgroundColor = '#f8f9fa';
});

// When the drop area is clicked
dropArea.addEventListener('click', function () {
    fileInput.click();
});

// When a file is selected via the file input
fileInput.addEventListener('change', function () {
    handleFiles(fileInput.files);
});

// Function to handle files
function handleFiles(files) {
    previewArea.innerHTML = ''; // Clear previous previews
    for (let file of files) {
        const fileReader = new FileReader();
        fileReader.onload = function (e) {
            const filePreview = document.createElement('div');
            filePreview.classList.add('file-preview');

            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = e.target.result;
                filePreview.appendChild(img);
            } else {
                filePreview.innerHTML = `<p>${file.name}</p>`;
            }

            previewArea.appendChild(filePreview);
        };
        fileReader.readAsDataURL(file);
    }
}