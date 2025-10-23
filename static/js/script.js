let selectedFile = null;

// Get elements
const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const convertBtn = document.getElementById('convertBtn');
const progressSection = document.getElementById('progressSection');
const resultSection = document.getElementById('resultSection');
const errorSection = document.getElementById('errorSection');
const resultMessage = document.getElementById('resultMessage');
const errorMessage = document.getElementById('errorMessage');

// Drag and drop handlers
uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.classList.add('drag-over');
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.classList.remove('drag-over');
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

// File input change handler
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

// Handle file selection
function handleFile(file) {
    // Check if it's a PDF
    if (!file.name.toLowerCase().endsWith('.pdf')) {
        alert('Please select a PDF file');
        return;
    }

    // Check file size (max 16MB)
    if (file.size > 16 * 1024 * 1024) {
        alert('File size must be less than 16MB');
        return;
    }

    selectedFile = file;

    // Update UI
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);

    uploadBox.style.display = 'none';
    fileInfo.style.display = 'flex';
    convertBtn.style.display = 'block';
    progressSection.style.display = 'none';
    resultSection.style.display = 'none';
    errorSection.style.display = 'none';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Remove file
function removeFile() {
    selectedFile = null;
    fileInput.value = '';

    uploadBox.style.display = 'block';
    fileInfo.style.display = 'none';
    convertBtn.style.display = 'none';
}

// Convert file
async function convertFile() {
    if (!selectedFile) return;

    // Hide convert button and show progress
    convertBtn.style.display = 'none';
    progressSection.style.display = 'block';
    resultSection.style.display = 'none';
    errorSection.style.display = 'none';

    // Create form data
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
        // Send request
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            // Success - download the file
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `uber_statement_${new Date().getTime()}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // Show success message
            progressSection.style.display = 'none';
            resultSection.style.display = 'block';
            resultMessage.textContent = 'Your Excel file has been downloaded successfully!';

        } else {
            // Error
            const error = await response.json();
            throw new Error(error.error || 'Conversion failed');
        }

    } catch (error) {
        // Show error message
        progressSection.style.display = 'none';
        errorSection.style.display = 'block';
        errorMessage.textContent = error.message || 'An error occurred while processing your file';
        console.error('Error:', error);
    }
}

// Reset form
function resetForm() {
    selectedFile = null;
    fileInput.value = '';

    uploadBox.style.display = 'block';
    fileInfo.style.display = 'none';
    convertBtn.style.display = 'none';
    progressSection.style.display = 'none';
    resultSection.style.display = 'none';
    errorSection.style.display = 'none';
}

// Click on upload box to trigger file input
uploadBox.addEventListener('click', () => {
    fileInput.click();
});
