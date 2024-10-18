// Hàm tạo mã băm SHA-256
function generateHash() {
    // Lấy dữ liệu từ textarea
    const inputData = document.getElementById("inputData").value.trim();
    const message = document.getElementById("message");
    const hashOutput = document.getElementById("hashOutput");
    
    if (inputData === "") {
        // Thông báo nếu người dùng chưa nhập dữ liệu
        message.textContent = "Vui lòng nhập dữ liệu.";
        message.style.color = "red";
        hashOutput.value = ""; // Xóa mã băm cũ
        return;
    }

    // Tạo mã băm SHA-256 bằng CryptoJS
    const hash = CryptoJS.SHA256(inputData).toString();
    hashOutput.value = hash; // Hiển thị mã băm

    // Hiển thị thông báo khi thành công
    message.textContent = "Mã băm đã được tạo thành công!";
    message.style.color = "green";
}

// Hàm Mine Block
function mineBlock() {
    const difficulty = 4; // Độ khó của quá trình đào (số lượng '0' đầu tiên)
    let nonce = 0; // Biến đếm thử nghiệm nonce
    const inputData = document.getElementById("inputData").value.trim();
    const message = document.getElementById("message");

    if (inputData === "") {
        message.textContent = "Vui lòng nhập dữ liệu để mine.";
        message.style.color = "red";
        return;
    }

    let hash = CryptoJS.SHA256(inputData + nonce).toString();
    const target = Array(difficulty + 1).join("0"); // Tạo chuỗi '0' theo độ khó

    while (hash.substring(0, difficulty) !== target) {
        nonce++;
        hash = CryptoJS.SHA256(inputData + nonce).toString();
    }

    // Cập nhật kết quả hash và thông báo đào thành công
    document.getElementById("hashOutput").value = hash;
    message.textContent = `Block đã được mine thành công với nonce = ${nonce}`;
    message.style.color = "green";
}
