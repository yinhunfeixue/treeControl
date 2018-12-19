let TreeControl = require('./TreeControl');


let tree = [
  {
    value: {
      id: 1
    },
    children: [
      {
        id: 11
      },
      {
        id: 12
      },
      {
        id: 13,
        x: 1
      }
    ],
  },
  {
    id: 2
  }
];

let control = new TreeControl('value', 'children');
let node = control.search(tree, (node) => node.id == 13);


console.log(control.getIndex(tree, (node) => node.id === 13));
console.log(JSON.stringify(node, null, 2));