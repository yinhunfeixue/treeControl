/**
 * 一个通用的树结构操作器，对源数据的结构没有要求
 * 我们定义一个树结点，有两个要素
 * 1. 结点数据
 * 1. 子结点列表
 * 
 * 但是，一般来说，对于不同的数据，获取这两个要素的方法不同，因此，需要为此定义两个属性
 * 1. dataGetter--类型为字符串或者格式为function(node)的函数，表示从结点中获取数据的方法
 * 1. childrenGetter--类型为字符串或者格式为function(node)的函数，表示从结点中获取子结点列表的方法
 * 
 * 例如，数据是
 * {
 *   value:{x:1},
 *   children:[
 *      {
 *        value:{x:2},
 *        children:[
 *           {
 *              value:{x:22}
 *           }
 *        ]
 *      },
 *      {
 *        value:{x:3},
 *      }
 *   ]
 * }
 * 
 * 那么
 * 1. dataGetter是'value'或者 (node)=>node.value
 * 1. childrenGetter'children'或者 (node)=>node.children
 * 
 * 在以上的基础上，实现以下方法
 * 
 * 1. Object search(tree, equalFunction)--搜索满足指定条件的第一个结点，如果要获取满足条件所有结点，请使用find
 *  + bool equalFunction(node, index, parent)
 * 
 * 1. Object searchParent(tree, equalFunction)--搜索满足指定条件的第一个结点的父结点
 *  + bool equalFunction(node, index, parent)
 *
 * 1. Array find(tree, findFunction)--查找所有符合条件的结点，并返回符合条件结点的一维数组
 *  + bool findFunction(node, index, parent)
 * 
 * 1. Array searchChain(tree, equalFunction)--搜索满足条件的第一个结点，并返回从一级结点到指定结点的数组，第一项是一级结点，最后一项是符合条件的结点
 * 例如上述数据，如果匹配函数为(node)=>node.value.x === 2，则返回数组为[object, object]，第一个object的value.x = 1，第二个object的value.x = 2
 *  + bool equalFunction(node, index, parent)
 * 
 * 1. object addAt(tree, equalFunction, child, index = -1)--在指定条件的结点的子结点的指定位置，插入新结点，默认插入到子结点集合的最后。 
 *  + bool equalFunction(node, index, parent)
 * 
 * 1. Array remove(tree, equalFunction, count = 0)--删除指定条件的结点，可限制删除的数量（默认全部删除)
 *  + bool equalFunction(node, index, parent)
 * 
 * 1. void forEach(tree, foreachFunction)--遍历所有结点，并执行指定的操作。 
 *  + void foreachFunction(node, index, parent)
 * 
 * 1. Tree map(tree, mapFunction)--遍历树，并返回一颗新树，新树的层级，结点数据和旧树相同，新树的每个结点为指定函数返回的值。  
 *  + object mapFunction(node, index, parent)
 * 
 * 1. Tree translate(sourceData, equalFunction, childrenName = 'children')--把一维数组，转换成树结构
 *  + bool equalFunction(node, parent)--parent是否是node的父结点
 * 
 * 1. Number count(tree)--获取结点的总数量
 * 
 */
class TreeControl {
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

  _getNodeData(node) {
    if (this.dataGetter instanceof Function) {
      return this.dataGetter(node);
    }
    else {
      return node[this.dataGetter];
    }
  }

  _getChildren(node) {
    if (this.childrenGetter instanceof Function) {
      return this.childrenGetter(node);
    }
    else {
      return node[this.childrenGetter];
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