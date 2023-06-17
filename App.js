const nextUnitOfWork = null;

function performUnitOfWork(nextUnitOfWork) {
  //TODO
}

function workLoop(deadline) {
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    //判断离浏览器再次拿回控制权还有多少时间
    shouldYield = deadline.timeRemaining() < 1;
  }

  requestIdleCallback(workLoop);
}

const TEXT_ELEMENT = 'TEXT_ELEMENT';

function createTextElement(text) {
  return { type: TEXT_ELEMENT, props: { nodeValue: text, children: [] } };
}

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => (typeof child === 'object' ? child : createTextElement(child))),
    },
  };
}

function render(elements, container) {
  //TODO 创建dom节点
  const {
    type,
    props: { children, nodeVlaue = '', ...attrs },
  } = elements;
  const dom = type === TEXT_ELEMENT ? document.createTextNode(nodeVlaue) : document.createElement(type);
  //TODO 添加属性
  for (const [key, value] of Object.entries(attrs)) {
    dom[key] = value;
  }
  //TODO 添加子节点
  for (const child of children) {
    render(child, dom);
  }
  //TODO 将dom节点添加到根节点
  container.appendChild(dom);
}

//库
const ReactDOM = {
  createElement,
  render,
};

//加载时调用
window.onloadstart = App();

function App() {
  //渲染内容
  // <div title='mini react'>
  //   <h1>纳贤</h1>
  //   <span>为了世界和平！</span>
  //   <a href='#'>加入我们！</a>
  // </div>;
  const element = ReactDOM.createElement(
    'div',
    { title: 'mini react' },
    ReactDOM.createElement('h1', null, '纳贤'),
    ReactDOM.createElement('span', null, '为了世界和平！'),
    ReactDOM.createElement('a', { href: '#' }, '加入我们！'),
  );

  const container = document.getElementById('root');
  ReactDOM.render(element, container);
}
