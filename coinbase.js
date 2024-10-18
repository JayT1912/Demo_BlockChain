document.addEventListener('DOMContentLoaded', function () {
    let peers = ['A', 'B', 'C'];

    // Transactions for each block
    const blockTransactions = {
        block1: [],
        block2: [
            { amount: 10.00, from: "Anders", to: "Sophia" },
            { amount: 20.00, from: "Anders", to: "Lucas" },
            { amount: 15.00, from: "Anders", to: "Emily" },
            { amount: 15.00, from: "Anders", to: "Madison" }
        ],
        block3: [
            { amount: 10.00, from: "Emily", to: "Jackson" },
            { amount: 5.00, from: "Madison", to: "Jackson" },
            { amount: 20.00, from: "Lucas", to: "Grace" }
        ],
        block4: [
            { amount: 15.00, from: "Jackson", to: "Ryan" },
            { amount: 5.00, from: "Emily", to: "Madison" },
            { amount: 8.00, from: "Sophia", to: "Jackson" }
        ],
        block5: [
            { amount: 2.00, from: "Jackson", to: "Alexander" },
            { amount: 6.00, from: "Ryan", to: "Carter" },
            { amount: 4.00, from: "Ryan", to: "Riley" },
            { amount: 9.95, from: "Grace", to: "Katherine" }
        ]
    };

    peers.forEach(peer => {
        for (let i = 1; i <= 5; i++) {
            let blockId = `block${peer}${i}`;
            let peerElement = document.getElementById(`block${peer}${i}`);

            if (peerElement) {
                // Thêm phần Block Number
                let blockNumberLabel = document.createElement('label');
                blockNumberLabel.textContent = 'Block:';
                let blockNumberInput = document.createElement('input');
                blockNumberInput.type = 'text';
                blockNumberInput.value = i;
                blockNumberInput.readOnly = true;
                peerElement.appendChild(blockNumberLabel);
                peerElement.appendChild(blockNumberInput);

                // Thêm phần Nonce
                let nonceLabel = document.createElement('label');
                nonceLabel.textContent = 'Nonce:';
                let nonceInput = document.createElement('input');
                nonceInput.type = 'text';
                nonceInput.id = `nonce${blockId}`;
                nonceInput.value = "0";
                nonceInput.readOnly = true;
                peerElement.appendChild(nonceLabel);
                peerElement.appendChild(nonceInput);

                // Thêm phần Coinbase
                let coinbaseLabel = document.createElement('label');
                coinbaseLabel.textContent = 'Coinbase:';
                peerElement.appendChild(coinbaseLabel);

                let coinbaseTable = document.createElement('table');
                let coinbaseRow = document.createElement('tr');
                coinbaseRow.innerHTML = `
                <td colspan="3">
                    <div class="coinbase-container">
                        <span>$</span>
                        <input type="text" id="coinbaseAmount${blockId}" value="100.00">
                        <span class="arrow">→</span>
                        <input type="text" id="coinbaseTo${blockId}" value="Anders">
                    </div>
                </td>
                `;
                coinbaseTable.appendChild(coinbaseRow);
                peerElement.appendChild(coinbaseTable);

                // Thêm phần giao dịch Tx
                let txLabel = document.createElement('label');
                txLabel.textContent = 'Tx:';
                peerElement.appendChild(txLabel);

                let txTable = document.createElement('table');
                txTable.id = `tx${blockId}`;
                peerElement.appendChild(txTable);

                // Thêm giao dịch vào block
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

                // Thêm phần Previous Hash
                let prevHashLabel = document.createElement('label');
                prevHashLabel.textContent = 'Prev:';
                let prevHashInput = document.createElement('input');
                prevHashInput.type = 'text';
                prevHashInput.id = `prevHash${blockId}`;
                prevHashInput.value = i === 1 ? '0000000000000000' : '';
                prevHashInput.readOnly = true;
                peerElement.appendChild(prevHashLabel);
                peerElement.appendChild(prevHashInput);

                // Thêm phần Hash
                let hashLabel = document.createElement('label');
                hashLabel.textContent = 'Hash:';
                let hashInput = document.createElement('input');
                hashInput.type = 'text';
                hashInput.id = `hash${blockId}`;
                hashInput.readOnly = true;
                peerElement.appendChild(hashLabel);
                peerElement.appendChild(hashInput);

                // Thêm nút Mine
                let mineButton = document.createElement('button');
                mineButton.textContent = 'Mine';
                mineButton.onclick = () => mineBlock(blockId, peer, i);
                peerElement.appendChild(mineButton);

                // Lắng nghe sự kiện thay đổi trong Coinbase và Tx
                document.querySelectorAll(`#tx${blockId} input[type="text"], #coinbaseAmount${blockId}, #coinbaseTo${blockId}`).forEach(input => {
                    input.addEventListener('input', () => updateHash(blockId, peer));
                });

                // Tự động mine block đầu tiên ngay khi tạo
                setTimeout(() => {
                    autoMineBlock(blockId, peer);
                }, 100); // Thêm độ trễ nhỏ để đảm bảo các giao dịch đã được load
            } else {
                console.log(`Phần tử với id ${blockId} không tồn tại!`);
            }
        }
    });
});

// Hàm cập nhật hash khi có thay đổi
function updateHash(blockId, peer) {
    let nonce = document.getElementById(`nonce${blockId}`).value;
    
    // Lấy dữ liệu từ Coinbase
    let coinbaseAmount = document.getElementById(`coinbaseAmount${blockId}`).value;
    let coinbaseTo = document.getElementById(`coinbaseTo${blockId}`).value;

    // Lấy dữ liệu từ giao dịch Tx
    let txTable = document.querySelectorAll(`#tx${blockId} input[type="text"]`);
    let txData = Array.from(txTable).map(input => input.value).join('');

    // Lấy prevHash
    let prevHash = document.getElementById(`prevHash${blockId}`).value;

    // Kết hợp Coinbase và Tx để tạo hash
    let dataToHash = `${nonce}${coinbaseAmount}${coinbaseTo}${txData}${prevHash}`;
    let hash = CryptoJS.SHA256(dataToHash).toString();

    // Cập nhật giá trị hash
    document.getElementById(`hash${blockId}`).value = hash;

    // Cập nhật prevHash cho block tiếp theo
    updateNextBlockPrevHash(peer, blockId, hash);
    checkChainValidity(peer); // Kiểm tra tính hợp lệ sau khi cập nhật hash
}
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

