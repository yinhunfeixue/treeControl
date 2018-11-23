let TreeControl = require('./TreeControl');


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
    id: "a",
  },
  {
    id: 4,
    x: 2,
    y: 2,
    childList: [
      {
        id: 50,
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

control.addAt(tree, (node) => {
  return node.id === 'a';
}, { id: 'aaa', x: 1000 }, 1000);

control.remove(tree, (node, i, parent) => {
  return control.getNodeData(node).id > 6;
})

console.log(JSON.stringify(tree, null, 2));