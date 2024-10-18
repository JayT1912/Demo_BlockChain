document.addEventListener('DOMContentLoaded', function () {
    let peers = ['A', 'B', 'C'];

    // Transactions for each block
    const blockTransactions = {
        block1: [
            { amount: 25.00, from: "Darcy", to: "Bingley" },
            { amount: 4.27, from: "Elizabeth", to: "Jane" },
            { amount: 19.22, from: "Wickham", to: "Lydia" },
            { amount: 106.44, from: "Lady Cath", to: "Collins" },
            { amount: 6.42, from: "Charlotte", to: "Elizabeth" }
        ],
        block2: [
            { amount: 97.67, from: "Ripley", to: "Lambert" },
            { amount: 48.61, from: "Kane", to: "Ash" },
            { amount: 6.15, from: "Parker", to: "Dallas" },
            { amount: 10.44, from: "Hicks", to: "Newt" },
            { amount: 88.32, from: "Bishop", to: "Burke" },
            { amount: 45.00, from: "Hudson", to: "Gorman" },
            { amount: 92.00, from: "Vasquez", to: "Apone" }
        ],
        block3: [
            { amount: 10.00, from: "Emily", to: "Jackson" },
            { amount: 5.00, from: "Madison", to: "Jackson" },
            { amount: 20.00, from: "Lucas", to: "Grace" }
        ],
        block4: [
            { amount: 62.19, from: "Rick", to: "Ilsa" },
            { amount: 867.96, from: "Captain Louis R", to: "Strasser" },
            { amount: 276.15, from: "Victor Laszlo", to: "Ilsa" },
            { amount: 97.13, from: "Rick", to: "Sam" },
            { amount: 119.63, from: "Captain Louis R", to: "Jan Brandel" }
        ],
        block5: [
            { amount: 14.12, from: "Denise Lc", to: "Edmund Lc" },
            { amount: 2760.29, from: "Lord Gler", to: "John Moran" },
            { amount: 413.78, from: "Katherine", to: "Miss Audrey" }
        ]
    };

    // Tạo block cho từng peer
    peers.forEach(peer => {
        for (let i = 1; i <= 5; i++) {
            let blockId = `block${peer}${i}`;
            let peerElement = document.getElementById(`block${peer}${i}`);
            peerElement.innerHTML = `
                <label>Block Number:</label>
                <input type="text" value="${i}" readonly>

                <label>Nonce:</label>
                <input type="text" id="nonce${blockId}" value="0" readonly>

                <label>Tx:</label>
                <table id="tx${blockId}"></table>

                <label>Previous Hash:</label>
                <input type="text" id="prevHash${blockId}" value="${i === 1 ? '0000000000000000' : ''}" readonly>

                <label>Hash:</label>
                <input type="text" id="hash${blockId}" readonly>

                <button onclick="mineBlock('${blockId}', '${peer}', ${i})">Mine</button>
            `;

            // Thêm giao dịch cho từng block
            let txTable = document.getElementById(`tx${blockId}`);
            let transactions = blockTransactions[`block${i}`];
            if (transactions) {
                transactions.forEach(tx => {
                    let row = document.createElement('tr');
                    row.innerHTML = `
                        <td>$<input type="text" value="${tx.amount}"></td>
                        <td>From: <input type="text" value="${tx.from}"></td>
                        <td>To: <input type="text" value="${tx.to}"></td>
                    `;
                    txTable.appendChild(row);
                });
            }

            // Lắng nghe sự kiện thay đổi trong giao dịch
            document.querySelectorAll(`#tx${blockId} input[type="text"]`).forEach(input => {
                input.addEventListener('input', () => updateHash(blockId, peer));
            });

            // Tự động mine block đầu tiên ngay khi tạo
            setTimeout(() => {
                autoMineBlock(blockId, peer);
            }, 100); // Thêm độ trễ nhỏ để đảm bảo các giao dịch đã được load
        }
    });
});

// Hàm mine block tự động
function autoMineBlock(blockId, peer) {
    let nonce = 0;
    let txData = Array.from(document.querySelectorAll(`#tx${blockId} input[type="text"]`)).map(input => input.value).join('');
    let prevHash = document.getElementById(`prevHash${blockId}`).value;
    let hash;

    // Tìm mã nonce hợp lệ
    do {
        nonce++;
        hash = CryptoJS.SHA256(nonce + txData + prevHash).toString();
    } while (!hash.startsWith('0000')); // Điều kiện để hash hợp lệ

    // Cập nhật nonce và hash hợp lệ
    document.getElementById(`nonce${blockId}`).value = nonce;
    document.getElementById(`hash${blockId}`).value = hash;

    // Cập nhật prevHash cho block tiếp theo
    updateNextBlockPrevHash(peer, blockId, hash);
    checkChainValidity(peer); // Kiểm tra tính hợp lệ của toàn bộ chuỗi
}

// Cập nhật hash của block tiếp theo
function updateNextBlockPrevHash(peer, currentBlockId, hash) {
    let blockNumber = parseInt(currentBlockId.replace(`block${peer}`, '')); // Lấy số block
    if (blockNumber < 5) {
        let nextBlockId = `block${peer}${blockNumber + 1}`;
        let nextPrevHashElement = document.getElementById(`prevHash${nextBlockId}`);
        if (nextPrevHashElement) {
            nextPrevHashElement.value = hash; // Cập nhật prevHash cho block tiếp theo
            updateHash(nextBlockId, peer); // Cập nhật hash cho block tiếp theo
        }
    }
}

// Cập nhật hash khi có thay đổi
function updateHash(blockId, peer) {
    let nonce = document.getElementById(`nonce${blockId}`).value;
    let txTable = document.querySelectorAll(`#tx${blockId} input[type="text"]`);
    let txData = Array.from(txTable).map(input => input.value).join('');
    let prevHash = document.getElementById(`prevHash${blockId}`).value;
    let hash = CryptoJS.SHA256(nonce + txData + prevHash).toString();
    document.getElementById(`hash${blockId}`).value = hash;

    // Cập nhật prevHash cho block tiếp theo
    updateNextBlockPrevHash(peer, blockId, hash);
    checkChainValidity(peer); // Kiểm tra tính hợp lệ sau khi cập nhật hash
}


// Mine block after the previous block has been mined
function mineBlock(blockId, peer) {
    let nonce = 0;
    let txTable = document.querySelectorAll(`#tx${blockId} input[type="text"]`);
    let txData = Array.from(txTable).map(input => input.value).join('');
    let prevHash = document.getElementById(`prevHash${blockId}`).value;
    let hash;

    console.log(`Mining block ${blockId} with txData: ${txData} and prevHash: ${prevHash}`);

    // Find valid nonce and hash
    do {
        nonce++;
        hash = CryptoJS.SHA256(nonce + txData + prevHash).toString();
    } while (!hash.startsWith('0000'));

    document.getElementById(`nonce${blockId}`).value = nonce;
    document.getElementById(`hash${blockId}`).value = hash;

    updateNextBlockPrevHash(peer, blockId, hash); // Update hash for the next block
    checkChainValidity(peer); // Check chain validity after mining
}

// Cập nhật màu của block
function updateBlockColor(blockId, isValid) {
    const blockElement = document.getElementById(blockId);
    
    if (isValid) {
        // Remove the invalid class first
        blockElement.classList.remove('block-invalid');
        
        // Add yellow background for valid blocks
        blockElement.classList.remove('block-valid');  // Remove the green valid class
        blockElement.style.backgroundColor = "#ffFbe6"; // Yellow background
        blockElement.style.borderColor = "#FFD700";     // Yellow border
    } else {
        // Apply red background for invalid blocks
        blockElement.classList.remove('block-valid');   // Remove valid class
        blockElement.style.backgroundColor = "#F7DED0"; // Red background
        blockElement.style.borderColor = "#e63946";     // Red border
        blockElement.classList.add('block-invalid');
    }
}


// Hàm kiểm tra tính hợp lệ của toàn bộ chuỗi
function checkChainValidity(peer) {
    let isValid = true;

    for (let i = 1; i <= 5; i++) {
        let blockId = `block${peer}${i}`;
        let nonce = document.getElementById(`nonce${blockId}`).value;
        let txData = Array.from(document.querySelectorAll(`#tx${blockId} input[type="text"]`)).map(input => input.value).join('');
        let prevHash = document.getElementById(`prevHash${blockId}`).value;
        let currentHash = document.getElementById(`hash${blockId}`).value;

        let calculatedHash = CryptoJS.SHA256(nonce + txData + prevHash).toString();

        // Kiểm tra hash có hợp lệ không
        if (currentHash !== calculatedHash || !currentHash.startsWith('0000')) {
            isValid = false;
        }

        // Cập nhật màu sắc của block
        updateBlockColor(blockId, isValid);

        // Nếu một block không hợp lệ, các block tiếp theo cũng không hợp lệ
        if (!isValid) {
            for (let j = i + 1; j <= 5; j++) {
                let nextBlockId = `block${peer}${j}`;
                updateBlockColor(nextBlockId, false);
            }
            break;
        }

        // Cập nhật prevHash cho block tiếp theo nếu hợp lệ
        if (i < 5) {
            let nextBlockId = `block${peer}${i + 1}`;
            document.getElementById(`prevHash${nextBlockId}`).value = calculatedHash;
        }
    }
}

