import React from 'react';
import ReactDom from 'react-dom/client';

import { createPortal } from 'react-dom';
import { Select } from 'antd';

const beautifyElements = [HTMLSelectElement];

function optionsToVlaues(options) {
  return Array.from(options).map(it => ({
    name: it.textContent,
    value: it.value, 
    selected: it.selected,
  }));
}

function ReplaceElement({ element }) {
  const [values, setValues] = React.useState([]);
  const [selectedValues, setSelectedValues] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const container = React.useRef(document.createElement('span'));
  React.useEffect(() => {
    element.style.display = 'none';
    if (element.parentElement.querySelector('.uno_choice_filter')) {
      element.parentElement.querySelector('.uno_choice_filter').style.display = 'none';
    }
    element.parentElement.prepend(container.current);
    new Promise((resolve, reject) => {
      if (element.getAttribute('fillUrl')) {
        setLoading(true);
        fetch(element.getAttribute('fillUrl')).then(r => r.json()).then(r => resolve(r.values || [])).then(() => {
          setLoading(false);
        });
        return
      }

      return resolve(optionsToVlaues(element.options));
    }).then(r => {
      setValues(r);
      setSelectedValues(r.filter(it => it.selected));
    });

    const observer = new MutationObserver(function (mutations) {
      const newValues = optionsToVlaues(element.options);
      setValues(newValues);
      setSelectedValues(newValues.filter(it => it.selected));
    });
    observer.observe(element, {subtree: true, attributes: false, childList: true});
    
    return () => observer.disconnect();
  }, []);

  const handleChange = React.useCallback((value, options) => {
    if (Array.isArray(value)) {
      Array.from(element.options).forEach(opt => {
        opt.selected = value.includes(opt.value);
      });
    } else {
      element.value = value;
    }

    element.dispatchEvent(new Event('change'));
    setSelectedValues(Array.isArray(value) ? value : [value]);
  }, [element]);

  return createPortal(
    <Select 
      loading={loading} 
      value={selectedValues} 
      onChange={handleChange} 
      style={{minWidth: 200, width: 'auto'}} 
      mode={element.multiple ? 'multiple' : ''} 
      showSearch
      allowClear
    >
      {values.map(opt => 
        <Select.Option key={opt.value} value={opt.value}>{opt.value}</Select.Option>
      )}
    </Select>, container.current);
}

function ContentScript({ }) {
  const [pageFormItems, setPageFormItems] = React.useState([]);

  React.useEffect(() => {
    const items = document.querySelectorAll('.jenkins-form-item');
    setPageFormItems(Array.from(items));
  }, []);

  return (
    <div>
      <div>
        {pageFormItems.map((item, i) => {
          const parameter = item.querySelector('.setting-main [name="parameter"]');
          return (
            <span key={i}>
              {beautifyElements.map((ele, j) => {
                const target = parameter.querySelector('input[type="hidden"]').nextElementSibling;
                if (parameter.children.length && target instanceof ele) {
                  return <ReplaceElement key={j} element={target} />;
                }

                return null;
              })}
            </span>
          );
        })}
      </div>
    </div>
  );
}


function main() {
  const container = document.createElement('div');
  document.body.prepend(container);
  ReactDom.createRoot(container).render(<ContentScript />);
}

main();

