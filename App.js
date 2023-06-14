let nextUnitOfWork = null;
// 把修改 DOM 这部分内容记录在 fiber tree 上，通过追踪这颗树来收集所有 DOM 节点的修改（work in progress root）
let wipRoot = null;
let currentRoot = null;

/**
 * 协调器 reconcile
 * @param {*} wipFiber
 * @param {*} elements
 */
function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let prevSibling = null;
  while (index < elements.length) {
    const element = elements[index];
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };

    if (index === 0) {
      wipFiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
    index++;
  }
}

function performUnitOfWork(fiber) {
  // add dom node
  const { dom, props } = fiber;
  if (!dom) {
    fiber.dom = createDom(fiber);
  }

  // create new fiber
  const elements = props.children;
  reconcileChildren(fiber, elements);

  // return next unit of work
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }

    nextFiber = nextFiber.parent;
  }
}

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

function createDom(fiber) {
  const {
    type,
    props: { children = [], ...rest },
  } = fiber;

  //根据type新建节点
  const dom = type === TEXT_ELEMENT ? document.createTextNode('') : document.createElement(type);

  //给节点添加属性
  for (const [key, value] of Object.entries(rest)) {
    dom[key] = value;
  }

  return dom;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  const domParent = fiber.parent.dom;
  domParent.appendChild(fiber.dom);
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitRoot() {
  // add nodes to dom
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  console.info(wipRoot);
  wipRoot = null;
}

function workLoop(deadline) {
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  // 把控制权交给浏览器
  requestIdleCallback(workLoop);
}

/**
 * 渲染器 renderer
 * @param {*} element
 * @param {*} container
 */
function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };

  nextUnitOfWork = wipRoot;
}

// 调度器 scheduler
requestIdleCallback(workLoop);

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
  //   <h1>打钱</h1>
  //   <div>
  //     <span>我是秦始皇！</span>
  //     <a href='#'>打钱！</a>
  //   </div>
  // </div>;
  const element = ReactDOM.createElement(
    'div',
    { title: 'mini react' },
    ReactDOM.createElement('h1', null, '纳贤'),
    ReactDOM.createElement('span', null, '为了世界和平！'),
    ReactDOM.createElement('a', { href: '#' }, '加入我们！'),
    ReactDOM.createElement('h1', null, '打钱'),
    ReactDOM.createElement(
      'div',
      null,
      ReactDOM.createElement('span', null, '我是秦始皇！'),
      ReactDOM.createElement('a', { href: '#' }, '打钱！'),
    ),
  );

  const container = document.getElementById('root');
  ReactDOM.render(element, container);
}
