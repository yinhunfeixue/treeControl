
# 一个通用的树结构操作器，对源数据的结构没有要求

## 树的定义
我们定义一个树结点，有两个要素
1. 结点数据
1. 子结点列表

但是，一般来说，对于不同的数据，获取这两个要素的方法不同，因此，需要为此定义两个属性
1. dataGetter--类型为字符串或者格式为function(node)的函数，表示从结点中获取数据的方法
1. childrenGetter--类型为字符串或者格式为function(node)的函数，表示从结点中获取子结点列表的方法

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

1.  `search(tree, equalFunction)=>Object`--搜索满足指定条件的第一个结点，如果要获取满足条件所有结点，请使用find

    | 参数名称 | 描述 | 类型 |
    |-|-|-|
    |tree|树数据|Array|
    |equalFunction|匹配函数|Function|

    `equalFunction`的参数分别为
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
    这样做的目的是可以更灵活的设置新树的结构
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


1. `addAt(tree, equalFunction, child, index = -1)`--在指定条件的结点的子结点的指定位置，插入新结点，默认插入到子结点集合的最后。 
    + bool equalFunction(node, index, parent)

1. `remove(tree, equalFunction, count = 0)`--删除指定条件的结点，可限制删除的数量（默认全部删除)
    + bool equalFunction(node, index, parent)