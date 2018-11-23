
# 一个通用的树结构操作器，对源数据的结构没有要求

## 树的定义
我们定义一个树结点，有两个要素
1. 结点数据
1. 子结点列表

但是，一般来说，对于不同的数据，获取这两个要素的方法不同，因此，需要为此定义两个属性
1. dataGetter--类型为字符串或者格式为function(node)的函数，表示从结点中获取数据的方法
1. childrenGetter--类型为字符串或者格式为function(node)的函数，表示从结点中获取子结点列表的方法

1. childrenCreater--给结点添加子元素时，如果结点没有子列表属性，则使用此方法创建初始化的子结点列表，默认为"children"

例如，数据是
```
{
  value:{x:1},
  children:[
     {
       value:{x:2},
       children:[
          {
             value:{x:22}
          },
       ]
     },
     {
       x:3
     }
  ]
}
```
那么
1. dataGetter是`'value'`或 `(node)=>{ return node.value || node }`
1. childrenGetter`'children'`或者 `(node)=>node.children`

在以上的基础上，实现以下方法

## 方法
1. `new TreeControl(dataGetter, childrenGetter, childrenCreater="children")`--构造器，必需指定获取结点值和子结点列表的方法
    
    | 参数名称 | 描述 | 类型 |
    |-|-|-|
    |dataGetter|获取结点值的方法，如果是字符串，则node[dataGetter]表示结点的值；如果是函数，则返回值表示结点的值|String\|(node)=>Object|
    |childrenGetter|获取子结点列表的方法，如果是字符串，则node[dataGetter]表示子结点列表；如果是函数，则返回值表示子结点列表|String\|(node)=>Array|
    |childrenCreater|给结点添加子结点时，如果子列表不存在，使用此属性创建子列表|String\|(node)=>Array

    **childrenCreater**的说明
    
    此属性仅在**添加子结点，且有结点无子列表属性**时有用，如果不使用添加操作，此属性可忽略

    如果childrenCreater设置为字符串（默认为`'children'`)，给结点创建初始化的子列表时，将使用node[childrenCreater] = []; 

    如果为函数，通常形式如下，1、指定结点的一个属性为空数组，2、返回此数组
    ```
    childrenCreater = (node) => {
      node.customChilren = [];
      return node.customChilren;
    }
    ```
    但是，要注意的是，childrenCreater和childrenGetter必须匹配，即通过`childrenGetter`可以获取到`childrenCreater`创建的值


1.  `search(tree, equalFunction)=>Object`--搜索满足指定条件的第一个结点，如果要获取满足条件所有结点，请使用find

    | 参数名称 | 描述 | 类型 |
    |-|-|-|
    |tree|树数据|Array|
    |equalFunction|匹配函数|Function|

    `equalFunction` 的参数依次为

    | 参数名称 | 描述 | 类型 |
    |-|-|-|
    |node|结点|Object|
    |index|结点在同级的位置|Number|
    |parent|当前结点的父结点|Object|
    
1. `searchParent(tree, equalFunction)=>Object`--搜索满足指定条件的第一个结点的父结点
    + 参数同上
 
1. `find(tree, findFunction)=>Array`--查找所有符合条件的结点，并返回符合条件结点的一维数组
    + 参数同上

1. `searchChain(tree, equalFunction)=>Array`--搜索满足条件的第一个结点，并返回从一级结点到指定结点的数组，第一项是一级结点，最后一项是符合条件的结点.
  
    例如上述数据，如果匹配函数为(node)=>node.value.x === 22，则返回数组为[object, object, object]，第一项的value.x = 1，第二项的value.x = 2,最后一项的value.x = 22
   + 参数同上

1. `forEach(tree, forEachFunction)=>void`--遍历所有结点，并执行指定的操作。 
    + 参数同上

1. `map(tree, mapFunction)=>Array`--创建一颗新树，新树的层级，结点数据和旧树相同，新树的每个结点为指定函数返回的值。

    **注意**：新树不会自动创建子结点，需要在mapFunction中，把返回值和参数中的newChildren进行关联，**例如
    ```
    mapFunction = (oldNode, index, oldParent, newChildren) =>{
      let result = {x:node.x};
      return result.children = newChildren;
    }
    ```
    这样做的目的是可以更灵活的设置新树的结构
    + `mapFunction(oldNode, index, oldParent, newChildren)=>object`，旧结点的处理函数，

    | 参数名称 | 描述 | 类型 |
    |-|-|-|
    |oldNode|原结点|object|
    |index|结点在同级中的位置|Number|
    |oldParent|原结点的父结点|object|
    |newChildren|预期的新子结点列表，如果设置子结点，需把子结点赋给返回值|Array


1. `count(tree)=>Number`--获取结点的总数量

    | 参数名称 | 描述 | 类型 |
    |-|-|-|
    | tree | 树数据 | Array |


1. `addAt(tree, equalFunction, child, index = -1)`--在指定条件的结点的子结点的指定位置插入新结点，默认插入到子结点集合的最后。如果指定位置超出范围（例如小于0，大于最大长度），会自动调整到有效小范围内

     | 参数名称 | 描述 | 类型 |
     |-|-|-|
     |tree|树结构数据|Array|
     |equalFunction|匹配函数，将在符合此函数的第一个结点下插入子结点|(node, index, parent)=>bool|
     |child|要插入的子结点|Object|
     |index|序号，如果小于0，将插入到第0项，如果大于子列表最大长度，将被添加到最后|Number

1. `remove(tree, equalFunction)`--删除指定条件的结点

    | 参数名称 | 描述 | 类型 |
    |-|-|-|
    |tree|树结构数据|Array|
    |equalFunction|匹配函数，将在符合此函数的第一个结点下插入子结点|(node, index, parent)=>bool|



## 示例
以下方数据为例，写了几个示例

#### 示例数据
注意观察下方数据
有的项的值放在**otherValue**属性中，有的项的值直接平铺在结点本身的属性中

有的项的子列表放在**childList**属性中，有的项的子列表放在**otherChildList**属性中
```
let tree = [
  {
    id: 1,
    x: 1,
    y: 1,
    childList: [
      {
        id: 2,
        x: 11,
        y: 11
      },
      {
        id: 3,
        x: 12,
        y: 12,
      }
    ],
  },

  {
    id: 4,
    x: 2,
    y: 2,
    childList: [
      {
        id: 5,
        x: 22,
        y: 21
      },
      {
        id: 6,
        x: 22,
        y: 22,
        otherChildList: [
          {
            otherValue: {
              id: 7,
              x: 221,
              y: 222,
            },
          }
        ],
      }
    ],
  }
];
```
#### 创建树控制对象
因为控制对象不确定树的结构，所以创建时，需要告诉控制对象两项要素
1. 获取节点值的方法
2. 获取子节点列表的方法

对于上述数据，控制对象如下
```
let control = new TreeControl(
  (node) => {
    //获取结点值的方法，优先从node.otherValue获取值，或者结点本身就是值
    return node.otherValue || node;
  },
  (node) => {
    //获取子结点列表的方法，优先从node.childList中获取，如果没有，则从node.otherChildList中获取
    return node.childList || node.otherChildList;
  }
);
```

创建完成后，可使用控制器进行操作

例如要搜索**x===22且序号是1**的结点

```
let node = control.search(tree, (node, i, parent) => {
  return node.x === 22 && i === 1;
});

console.log(node.id);    //6
```

如果**只需要x===22**，在匹配函数中，去掉i === 1即可，代码如下
```
let node = control.search(tree, (node, i, parent) => {
  return node.x === 22;
});

console.log(node.id);   //5
```