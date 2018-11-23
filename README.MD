
一个通用的树结构操作器，对源数据的结构没有要求
我们定义一个树结点，有两个要素
1. 结点数据
1. 子结点列表

但是，一般来说，对于不同的数据，获取这两个要素的方法不同，因此，需要为此定义两个属性
1. dataGetter--类型为字符串或者格式为function(node)的函数，表示从结点中获取数据的方法
1. childrenGetter--类型为字符串或者格式为function(node)的函数，表示从结点中获取子结点列表的方法

例如，数据是
{
  value:{x:1},
  children:[
     {
       value:{x:2},
       children:[
          {
             value:{x:22}
          }
       ]
     },
     {
       value:{x:3},
     }
  ]
}

那么
1. dataGetter是'value'或者 (node)=>node.value
1. childrenGetter'children'或者 (node)=>node.children

在以上的基础上，实现以下方法

1. Object search(tree, equalFunction)--搜索满足指定条件的第一个结点，如果要获取满足条件所有结点，请使用find
 + bool equalFunction(node, index, parent)

1. Object searchParent(tree, equalFunction)--搜索满足指定条件的第一个结点的父结点
 + bool equalFunction(node, index, parent)
 
1. Array find(tree, findFunction)--查找所有符合条件的结点，并返回符合条件结点的一维数组
 + bool findFunction(node, index, parent)

1. Array searchChain(tree, equalFunction)--搜索满足条件的第一个结点，并返回从一级结点到指定结点的数组，第一项是一级结点，最后一项是符合条件的结点
例如上述数据，如果匹配函数为(node)=>node.value.x === 2，则返回数组为[object, object]，第一个object的value.x = 1，第二个object的value.x = 2
 + bool equalFunction(node, index, parent)

1. object addAt(tree, equalFunction, child, index = -1)--在指定条件的结点的子结点的指定位置，插入新结点，默认插入到子结点集合的最后。 
 + bool equalFunction(node, index, parent)

1. Array remove(tree, equalFunction, count = 0)--删除指定条件的结点，可限制删除的数量（默认全部删除)
 + bool equalFunction(node, index, parent)

1. void forEach(tree, foreachFunction)--遍历所有结点，并执行指定的操作。 
 + void foreachFunction(node, index, parent)

1. Tree map(tree, mapFunction)--遍历树，并返回一颗新树，新树的层级，结点数据和旧树相同，新树的每个结点为指定函数返回的值。  
 + object mapFunction(node, index, parent)

1. Tree translate(sourceData, equalFunction, childrenName = 'children')--把一维数组，转换成树结构
 + bool equalFunction(node, parent)--parent是否是node的父结点

1. Number count(tree)--获取结点的总数量
