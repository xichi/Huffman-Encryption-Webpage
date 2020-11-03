function Huffman(str) {
  // 需要编码的字符串
  this.str = str;
  // 键和频率映射表
  this.keyCountMap = null;
  // 编码和键的映射表
  this.codeKeyMap = {};
  // 键和编码的映射表
  this.keyCodeMap = {};
  // 哈夫曼树节点列表
  this.nodeList = null;
  // 哈夫曼树根节点
  this.root = null;
  // 哈夫曼编码后的01序列
  this.code = null;
  // 压缩比
  this.rate = 0;
}
Huffman.prototype.cal = function cal() {
  let str = this.str;
  let map = {};
  let i = 0;
  while(str[i]) {
    map[str[i]] ? map[str[i]]++ : (map[str[i]] = 1);
    i++;
  }
  this.keyCountMap = map;
}
Huffman.prototype.sort = function sort() {
  let map = this.keyCountMap;
  let result = [];
  for (let key in map) {
    if(map.hasOwnProperty(key)) {
      let obj = {
        key: key,
        val: map[key]
      };
      result.push(new Node(null, null, obj));
    }
  }
  this.nodeList = result.sort(function(x,y){return x.data.val - y.data.val});
}
function Node(left, right, data) {
  this.left = left;
  this.right = right;
  this.data = data;
}
Huffman.prototype.makeTree = function makeTree() {
  let i = 0;
  let parentNode;
  let table = this.nodeList;
  while(table.length > 1) {
    parentNode = new Node(table[i], table[i+1], {key: null, val: table[i]['data'].val + table[i+1]['data'].val});
    table.splice(i,2);
    table.unshift(parentNode);
    table.sort(function(x,y){return x.data.val - y.data.val});
  }
  this.root = table[0] || new Node();
  return this.root;
}
Huffman.prototype.traversal = function traversal(tree, code) {
  if (tree.left !== null) {
    traversal.call(this,tree.left, code + '0');
  } else {
    this.keyCodeMap[tree.data.key] = code;
  }
  if (tree.right !== null) {
    traversal.call(this, tree.right,code + '1');
  } else {
    this.keyCodeMap[tree.data.key] = code;
  }
}
Huffman.prototype.encode = function encode() {
  this.cal();
  this.sort();
  let root = this.makeTree();
  this.traversal(root, '');
  let ret = this.keyCodeMap;
  let i = 0;
  let result = '';
  let str = this.str;
  while(str[i]) {
    result += ret[str[i++]];
  }
  this.code = result;
  let origin = this.str.length * Math.ceil(Math.log(Object.keys(this.keyCountMap)?.length) / Math.log(2));
  let rate = this.code.length / origin;
  this.rate = rate.toFixed(2)
  return result
}
Huffman.prototype.reverseMap = function reverseMap() {
  let ret = this.keyCodeMap;
  let result = {};
  for (let key in ret) {
    if(ret.hasOwnProperty(key)) {
      result[ret[key]] = key;
    }
  }
  this.codeKeyMap = result;
  return result;
}
Huffman.prototype.decode = function decode() {
  let i = 0;
  let result = '';
  let data = '';
  let map = this.reverseMap();
  let str = this.code;
  while(str) {
    result += str[i++];
    if (result in map) {
      data += map[result];
      str = str.replace(new RegExp("^"+result),'');
      result = '';
      i = 0;
    }
  }
  return data;
}
export default Huffman;