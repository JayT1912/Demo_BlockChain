function calculateHash() {
    let blockNumber = document.getElementById("blockNumber").value;
    let data = document.getElementById("data").value;
    let nonce = document.getElementById("nonce").value;

    let hash = CryptoJS.SHA256(blockNumber + nonce + data).toString();
    document.getElementById("hash").value = hash;
}

document.getElementById("data").addEventListener("input", calculateHash);
document.getElementById("nonce").addEventListener("input", calculateHash);

document.getElementById("mineButton").addEventListener("click", function () {
    let blockNumber = document.getElementById("blockNumber").value;
    let data = document.getElementById("data").value;

    let nonce = 0;
    let hash = "";
    let difficulty = "0000"; 

    do {
        nonce++;
        hash = CryptoJS.SHA256(blockNumber + nonce + data).toString();
    } while (hash.substring(0, difficulty.length) !== difficulty);

    document.getElementById("nonce").value = nonce;
    document.getElementById("hash").value = hash;
});
