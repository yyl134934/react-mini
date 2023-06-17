let nextUnitOfWork = null;

function createDom(fiber) {
  // 创建dom节点
  const {
    type,
    props: { children, nodeVlaue = '', ...attrs },
  } = fiber;
  const dom = type === TEXT_ELEMENT ? document.createTextNode(nodeVlaue) : document.createElement(type);
  // 添加属性
  for (const [key, value] of Object.entries(attrs)) {
    dom[key] = value;
  }
  // 返回dom节点
  return dom;
}

function performUnitOfWork(fiber) {
  //TODO 新建dom
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
  }

  //TODO 新建Fiber
  let prevSibling = null;
  const {
    props: { children: elements },
  } = fiber;

  for (const index in elements) {
    const { type, props } = elements[index];

    const newFiber = {
      type: type,
      dom: null,
      parent: fiber,
      props: props,
    };

    if (index == 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
  }

  //TODO 返回下一个工作单元
  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;
  while (nextFiber) {
    // 取兄弟节点或者叔伯节点
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
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

function render(element, container) {
  // 设置下一个工作单元/初始工作单元
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  };

  requestIdleCallback(workLoop);
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
