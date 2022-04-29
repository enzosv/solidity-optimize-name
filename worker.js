importScripts('https://cdn.rawgit.com/emn178/js-sha3/fb7e6403/build/sha3.min.js');

const CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
// CHARS.forEach(function (c, index) {
//     CHAR_CODE_MAP[index] = c.charCodeAt(0);
// });
const CHAR_CODE_MAP = { "0": 48, "1": 49, "2": 50, "3": 51, "4": 52, "5": 53, "6": 54, "7": 55, "8": 56, "9": 57, "10": 97, "11": 98, "12": 99, "13": 100, "14": 101, "15": 102, "16": 103, "17": 104, "18": 105, "19": 106, "20": 107, "21": 108, "22": 109, "23": 110, "24": 111, "25": 112, "26": 113, "27": 114, "28": 115, "29": 116, "30": 117, "31": 118, "32": 119, "33": 120, "34": 121, "35": 122, "36": 65, "37": 66, "38": 67, "39": 68, "40": 69, "41": 70, "42": 71, "43": 72, "44": 73, "45": 74, "46": 75, "47": 76, "48": 77, "49": 78, "50": 79, "51": 80, "52": 81, "53": 82, "54": 83, "55": 84, "56": 85, "57": 86, "58": 87, "59": 88, "60": 89, "61": 90 };

var data = { blocks: [], s: [] };
function save(hash) {
    data.reset = hash.reset;
    data.block = hash.block;
    data.start = hash.start;
    data.finalized = hash.finalized;
    data.lastByteIndex = hash.lastByteIndex;
    for (var i = 0; i < hash.blocks.length; ++i) {
        data.blocks[i] = hash.blocks[i];
    }
    for (var i = 0; i < hash.s.length; ++i) {
        data.s[i] = hash.s[i];
    }
}

function restore(hash) {
    hash.reset = data.reset;
    hash.block = data.block;
    hash.start = data.start;
    hash.finalized = data.finalized;
    hash.lastByteIndex = data.lastByteIndex;
    for (var i = 0; i < data.blocks.length; ++i) {
        hash.blocks[i] = data.blocks[i];
    }
    for (var i = 0; i < data.s.length; ++i) {
        hash.s[i] = data.s[i];
    }
}

function toBytes(str) {
    var bytes = [];
    for (var i = 0; i < str.length; ++i) {
        bytes.push(str.charCodeAt(i));
    }
    return bytes;
}

function increase(bytes) {
    bytes[0] += 1;
    for (var i = 0; i < bytes.length; ++i) {
        if (bytes[i] === 64) {
            bytes[i] = 0;
            if (i == bytes.length - 1) {
                bytes[i + 1] = 1;
            } else {
                bytes[i + 1] += 1;
            }
        } else {
            break;
        }
    }
    return bytes;
}

function toChars(bytes) {
    var str = '';
    for (var i = 0; i < bytes.length; ++i) {
        str += CHARS[bytes[i]];
    }
    return str;
}

function toCharCodes(bytes) {
    var codes = [];
    for (var i = 0; i < bytes.length; ++i) {
        codes.push(CHAR_CODE_MAP[bytes[i]]);
    }
    return codes;
}

onmessage = function (e) {
    console.time('find');
    let obj = e.data[0];
    let after = e.data[1];
    var sig = obj.name + obj.args;
    var args = toBytes(obj.args);
    var bytes = [0];
    var index = 0;
    const prefix = toBytes(obj.name + '_');
    var hash = keccak256.create();
    hash.update(prefix);
    save(hash);
    var char = keccak256.array(sig);
    var id = ""
    while (true) {
        sig = obj.name + '_' + toChars(bytes) + char + obj.args;
        id = keccak256(sig).substr(0, 8)
        if (id.startsWith('0000') && id > after) {
            break
        }
        if (index >= CHARS.length) {
            // add more chars
            increase(bytes);
            hash = keccak256.create();
            hash.update(prefix);
            hash.update(toCharCodes(bytes));
            save(hash);
            index = 0;
        }
        char = CHARS[index];
        hash.update(char);
        hash.update(args);
        restore(hash);
        // try next char
        ++index;
    }
    console.timeEnd('find')
    postMessage([sig, id]);
}