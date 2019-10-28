var Suggest = (function(){
  function Suggest(input, o) {
    this.input = document.getElementById(input);
    this.options = o = o || {};

    configure(
      this,
      {
        minChars: 2,
        maxItems: 3,
        data: []
      },
      o
    );

    init(this);

    this.input.addEventListener('input', handleInput.bind(this), false);
  }

  function handleInput() {
    var eggPopover = document.getElementById('egg-popover');

    empty(eggPopover);
    if (this.input.value.length >= this.minChars) {
      eggPopover.setAttribute('style', 'display: visible');
      var dataList = [];
      var dataListCount = [];
      var html = '';
      this.list.map(item => {
        dataList.push(filterTerm(JSON.parse(item), this.input.value, this.maxItems));
        dataListCount.push(filterTerm(JSON.parse(item), ''));
      });
      var showData = mapArray(this.sectionName, this.sectionType, dataList);
      var count = mapArray(this.sectionName, this.sectionType, dataListCount);

      count.map(item => {
        if(item.type == 'product') {
          this.countProduct = item.data.length;
        }
      })

      showData.map(item => {
          var li = item.data.map(function(itemLi){
            return renderLi(itemLi, item.type, this.input.value);
          }.bind(this))
          html += `<h2>${item.name}</h2>` + renderUl(li.join(''));
      });

      eggPopover.innerHTML = html + `<p><a href="#">See all ${this.countProduct} products</a></p>`
    } else {
      eggPopover.setAttribute('style', 'display: none');
    }
  }

  function filterTerm(arr, str, maxItem) {
    var PATTERN = new RegExp(str);
    return arr.filter(item => PATTERN.test(item.title)).slice(0, maxItem);
  }

  function mapArray(arrName, arrSection, arrList) {
    var obj = [];
    arrName.map((item, key) => {
      obj.push({
        name: item,
        type: arrSection[key],
        data: arrList[key]
      })
    })
    return obj;
  }

  function hightLight(sten, str) {
    var PATTERN = new RegExp(str);
    return sten.replace(PATTERN, `<mark>${str}</mark>`)
  }

  function getProp(arr, type) {
    var section = [];
    arr.map(item => section.push(item[type]));
    return section;
  }

  function init(instance) {
    var wrapper = document.createElement('div');
    var popover = document.createElement('div');
    setAttributes(wrapper, {
      id: 'egg-wrapper',
      class: 'egg-wrapper'
    });
    setAttributes(popover, {
      id: 'egg-popover',
      class: 'egg-popover',
      style: 'display: none'
    });
    wrap(instance.input, wrapper);
    wrapper.appendChild(popover);

    //fetch data
    fetchData(instance);
    instance.sectionName = getProp(instance.data, 'title');
    instance.sectionType = getProp(instance.data, 'type');
  }

  function renderUl(data) {
    var ul = '';
    if(data.length == 0) {
      ul = `
        <ul>
          <li class="no-data">No Result</li>
        </ul>
      `
    } else {
      ul = `
        <ul>
          ${data}
        </ul>
      `
    }

    return ul;
  }

  //Term Helper
  function renderLi(dataObj, type, str) {
    const liTerm = `
      <li>
        ${hightLight(dataObj.title, str)}
      </li>
    `;
    const liCollection = `
      <li>
        <a href="${dataObj.url}" title="${dataObj.title}">${hightLight(dataObj.title, str)}</a>
      </li>
    `;
    const liProduct = `
      <li class="media">
        <a href="${dataObj.url}" title="${dataObj.title}">
          <img src="${dataObj.image}" alt="${dataObj.title}" />
          <div>
            <h3>${hightLight(dataObj.title, str)}</h3>
            <h4>${dataObj.brand}</h4>
            <h5>${dataObj.price}</h5>
          </div>
        </a>
      </li>
    `;
    const divCount = `
      <p><a>See all 8 products</a></p>
    `

    switch (type) {
      case 'product':
        return liProduct;
      case 'collection':
        return liCollection;
      case 'term':
        return liTerm;
      default:
        return divCount;
    }

  }

  //Helper function

  function get(url) {
    return new Promise(function(resolve, reject) {
      let httpRequest = new XMLHttpRequest();
      httpRequest.open('GET', url);
      httpRequest.onload = function() {
        if (httpRequest.status === 200) {
          // Resolve the promise with the response text
          // success(httpRequest.responseText);
          resolve(httpRequest.response);
        } else {
          // Reject the promise with the status text
          // fail(httpRequest.status);
          reject(Error(httpRequest.statusText));
        }
      };

      // Handle network errors
      httpRequest.onerror = function() {
        reject(Error('Network Error'));
      };

      httpRequest.send();
    });
  }

  function empty(elm) {
    elm.innerHTML = '';
  }

  function mapObjectToArray(arr, cb) {
    var res = [];
    arr.map(item => res.push(cb(item.uri)));
    return res;
  }

  function fetchData(instance) {
    Promise.all(mapObjectToArray(instance.data, get))
      .then(function(responses) {
        instance.list = responses;
      })
      .then(function(literals) {
      })
      .catch(function(status) {
        //failHandler(status);
      })
      .finally(function() {
      });
  }

  function setAttributes(el, attrs) {
    for (var key in attrs) {
      el.setAttribute(key, attrs[key]);
    }
  }

  function wrap(el, wrapper) {
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
  }

  function configure(instance, properties, o) {
    for (var i in properties) {
      var initial = properties[i],
        attrValue = instance.input.getAttribute('data-' + i.toLowerCase());

      if (typeof initial === 'number') {
        instance[i] = parseInt(attrValue, 10);
      } else if (initial === false) {
        // Boolean options must be false by default anyway
        instance[i] = attrValue !== null;
      } else if (initial instanceof Function) {
        instance[i] = null;
      } else {
        instance[i] = attrValue;
      }

      if (!instance[i] && instance[i] !== 0) {
        instance[i] = i in o ? o[i] : initial;
      }
    }
  }

  return Suggest;
})();