const TEXT_ELEMENT = 'TEXT_ELEMENT';

function createTextElement(text) {
  return {
    type: TEXT_ELEMENT,
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createElement(type, attrs, ...children) {
  return {
    type,
    props: {
      ...attrs,
      children: children.map((child) => (typeof child === 'object' ? child : createTextElement(child))),
    },
  };
}

/**
 * 渲染器
 * @param {*} element
 * @param {*} container
 */
function render(element, container) {
  const {
    type,
    props: { children = [], ...rest },
  } = element;

  //根据type新建节点
  const dom = type === TEXT_ELEMENT ? document.createTextNode('') : document.createElement(type);

  //给节点添加属性
  for (const [key, value] of Object.entries(rest)) {
    dom[key] = value;
  }

  //添加子节点
  for (const child of children) {
    render(child, dom);
  }

  //添加到root
  container.appendChild(dom);
}
//库
const ReactDOM = {
  createElement,
  render,
};

//加载时调用
window.onload(App());

function App() {
  //渲染内容
  // <div title='mini react'>
  //   <span >为了世界和平！</span>
  //   <a href='#'>加入我们！</a>
  // </div>;
  const element = ReactDOM.createElement(
    'div',
    { title: 'mini react' },
    ReactDOM.createElement('span', null, '为了世界和平！'),
    ReactDOM.createElement('a', { href: '#' }, '加入我们！'),
  );

  const container = document.getElementById('root');
  ReactDOM.render(element, container);
}
