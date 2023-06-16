function createElement(type, props, ...children) {
  return { type, props: { ...props, children } };
}

function render(elements, container) {
  //TODO 渲染节点
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
