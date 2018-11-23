/**
 * 一个通用的树结构操作器，对源数据的结构没有要求
 */
class TreeControl {

  /**
   * 创建树控制器实例
   * @param {String|Function} dataGetter 获取结点值的方法，为字符串或(node)=>object的函数
   * @param {String|Function} childrenGetter 获取结点子结点列表的方法，为字符串或(node)=>object的函数
   */
  constructor(dataGetter = "value", childrenGetter = "children") {
    if (!dataGetter) {
      throw new Error('dataGetter need value');
    }
    else if (!childrenGetter) {
      throw new Error('childrenGetter need value');
    }
    else {
      this.dataGetter = dataGetter;
      this.childrenGetter = childrenGetter;
    }
  }

  /**
   * 搜索满足指定条件的第一个结点
   * @param {Array} tree 树结点的数据
   * @param {*} equalFunction 匹配函数，格式为(node, index, parentNode)=>bool
   */
  search(tree, equalFunction) {
    let chain = this._searchChainInner(tree, equalFunction);
    return chain ? chain[chain.length - 1] : null;
  }

  /**
   * 搜索满足指定条件的第一个结点的父结点
   * @param {Array} tree 树
   * @param {*} equalFunction 匹配函数，格式为(node, index, parentNode)=>bool
   */
  searchParent(tree, equalFunction) {
    let chain = this._searchChainInner(tree, equalFunction);
    if (chain && chain.length >= 2) {
      return chain[chain.length - 2];
    }
    return null;
  }

  /**
   * 搜索满足条件的第一个结点，并返回从一级结点到指定结点的数组，第一项是一级结点，最后一项是符合条件的结点
   * @param {Array} tree 树
   * @param {Function} equalFunction 匹配函数，格式为(node, index, parentNode)=>bool
   */
  searchChain(tree, equalFunction) {
    return this._searchChainInner(tree, equalFunction);
  }

  /**
   * 遍历树结点，并对每个结点执行回调函数
   * @param {Array} tree 树
   * @param {Function} forEachFunction 回调函数，格式为(node, index, parentNode)=>bool
   */
  forEach(tree, forEachFunction) {
    this._forEachInner(tree, forEachFunction);
  }

  /**
   * 查找所有符合条件的结点，并返回符合条件结点的一维数组
   * @param {Array} tree 树
   * @param {Function} equalFunction 匹配函数，格式为(node, index, parentNode)=>bool
   */
  find(tree, equalFunction) {
    let result = [];
    this.forEach(
      tree,
      (node, i, parent) => {
        if (equalFunction(node, i, parent)) {
          result.push(node);
        }
      }
    );
    return result;
  }

  /**
   * 计算树的结点总数
   * @param {Array} tree 树
   */
  count(tree) {
    let result = 0;
    this.forEach(tree, () => {
      result++;
    });
    return result;
  }

  /**
   * 遍历树，并创建和原结构一致的新树。新树的结点为原树结点调用函数处理后的值
   * 
   * **注意**，新树不会自动创建子结点，需要在mapFunction中，把返回值和参数中的newChildren进行关联，例如result.children = newChildren
   * 
   * @param {*} tree 
   * @param {*} mapFunction 格式为(node, index, oldParent, newChildren)=>Object
   */
  map(tree, mapFunction) {
    return this._mapInner(tree, mapFunction);
  }

  /**
   * 
   * @param {*} tree 
   * @param {*} mapFunction 
   * @param {*} parent 
   * 
   * @private
   */
  _mapInner(tree, mapFunction, parent = null) {
    //循环树结点，并先递归子树，获取用mapFunction创建的新子树
    //子树递归完成后，用mapFunction对当前结点创建新结点，并放到新树中
    //把子树放到新结点的子列表中
    if (tree) {
      let result = [];
      for (let i = 0; i < tree.length; i++) {
        let node = tree[i];
        let children = this.map(this._getChildren(node), mapFunction, node);
        let newNode = mapFunction(node, i, parent, children);
        result.push(newNode);
      }
      return result;
    }
    return null;
  }

  /**
   * 内部用于递归搜索结点链的函数
   * @param {*} tree 树
   * @param {*} equalFunction 匹配函数，格式为(node, index, parentNode)=>bool
   * @param {*} parent 父结点
   * 
   * @private
   */
  _searchChainInner(tree, equalFunction, parent = null) {
    if (tree) {
      //循环树，如果有结点符合条件，则放到数组中返回
      //如果结点不符合条件，但是有子结点，则递归子结点，如果从子结点中找到结点，把当前结点放到子结果中，一起返回
      for (let i = 0; i < tree.length; i++) {
        let node = tree[i];
        if (equalFunction(node, i, parent)) {
          return [node];
        }
        else {
          let children = this._getChildren(node);
          if (children) {
            let childResult = this._searchChainInner(children, equalFunction, node);
            if (childResult) {
              childResult.unshift(node);
              return childResult;
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * 遍历树(内部函数，勿用)
   * @param {*} tree 
   * @param {*} forEachFunction 要对结点进行操作的函数，格式为(node, index, parentNode)=>void
   * @param {*} parent 
   * 
   * @private
   */
  _forEachInner(tree, forEachFunction, parent = null) {
    if (tree) {
      //遍历结点，对结点执行操作，并递归子结点
      for (let i = 0; i < tree.length; i++) {
        let node = tree[i];
        forEachFunction(node, i, parent);
        this._forEachInner(this._getChildren(node), forEachFunction);
      }
    }
    return null;
  }

  /**
  * @private
  * @param {*} node 
  */
  _getNodeData(node) {
    if (this.dataGetter instanceof Function) {
      return this.dataGetter(node);
    }
    else {
      return node[this.dataGetter];
    }
  }

  /**
   * @private
   * @param {*} node 
   */
  _getChildren(node) {
    if (this.childrenGetter instanceof Function) {
      return this.childrenGetter(node);
    }
    else {
      return node[this.childrenGetter];
    }
  }
}




let tree = [
  {
    x: 1,
    y: 1,
    childList: [
      {
        x: 11,
        y: 11
      },
      {
        x: 12,
        y: 12,
      }
    ],
  },

  {
    x: 2,
    y: 2,
    childList: [
      {
        x: 21,
        y: 21
      },
      {
        x: 22,
        y: 22,
        otherChildList: [
          {
            otherValue: {
              x: 221,
              y: 222,
            },
          }
        ],
      }
    ],
  }
];

let control = new TreeControl(
  (node) => {
    return node.otherValue || node;
  },
  (node) => {
    return node.childList || node.otherChildList;
  }
);

let equalFunction = (node) => {
  return node.otherValue && node.otherValue.x === 221;
};

let node = control.search(tree, equalFunction);

let parent = control.searchParent(tree, equalFunction)

let chain = control.searchChain(tree, equalFunction);

let find = control.find(tree, (node) => {
  return node.x < 30;
});

let count = control.count(tree);

let newTree = control.map(tree, (node, i, oldParent, newChildren) => {
  let result = { x: node.x || node.otherValue.x, index: i };
  if (newChildren) {
    result.myChildren = newChildren;
  }
  return result;
});


console.log(node.otherValue.x);
console.log(parent.x);
console.log(chain.map(item => item.x || item.otherValue.x).join(","));
console.log(find.map(item => item.x || item.otherValue.x).join(","));
console.log(count);
console.log(JSON.stringify(newTree, null, 2));