const modal = new bootstrap.Modal('#modalUser', {});
const modalDom = document.querySelector('#modalUser');
let form = modal._dialog.querySelector('form')
let options = {
  theme: 'bootstrap-5',
  width: 'style',
  minimumResultsForSearch: Infinity,
}

/**
 * Get students
 * @returns {Promise<*>}
 */
const getClients = async () => {
  const response = await fetch('http://localhost:3000/api/clients');
  return await response.json();
}

/**
 * Get students
 * @returns {Promise<*>}
 */
const getClientByID = async (id) => {
  const response = await fetch(`http://localhost:3000/api/clients/${id}`);
  return await response.json();
}

/**
 * Get format students
 * @param items
 * @returns {*}
 */
function getFormatClients(items) {
  return items.map((item, i, arr) => {
    let newClient = {};
    newClient['id'] = item['id'];
    newClient['fio'] = item['surname'] + ' ' + item['name'] + ' ' + item['lastName'];
    newClient['createdAt'] = formatDate(item['createdAt']);
    newClient['updatedAt'] = formatDate(item['updatedAt']);
    newClient['contacts'] = item['contacts'];
    return newClient;
  });
}

/**
 * Get html td student
 * @param tr
 * @param clientObj
 * @returns {void}
 */
function renderClientItem(tr, clientObj) {
  if (typeof clientObj === 'object') {
    for (let key in clientObj) {
      let td = document.createElement('td');
      if (key === 'contacts') {
        td.appendChild(renderContactsByClient(clientObj[key]));
      } else {
        td.classList.add(key);
        td.innerHTML = clientObj[key];
      }
      tr.append(td);
    }
  }
}

function renderContactsByClient(contacts) {
  let ul = document.createElement('ul');
  ul.classList.add('contacts-list', 'd-flex', 'align-content-around', 'flex-wrap', 'list-reset');
  contacts.forEach((item, i) => {
    let li = document.createElement('li');
    li.setAttribute('data-bs-toggle', 'tooltip');
    li.setAttribute('data-bs-custom-class', 'custom-tooltip');
    li.setAttribute('data-bs-placement', 'top');
    li.setAttribute('data-bs-title', `${item['type']}: <span class="tooltip-inner-value">${item['value']}</span>`);
    li.setAttribute('data-bs-html', true);
    li.classList.add('list-item');
    if (i >= 4) li.classList.add('hidden');
    let a = document.createElement('a');
    a.classList.add('icon', `${translitWord(item['type']).toLowerCase()}`);
    a.target = '_blank';
    a.href = hrefForContacts(item);
    li.append(a);
    ul.append(li);
  });
  let btnShowLI = document.createElement('li');
  btnShowLI.classList.add('btn-li', 'd-flex', 'align-items-center', 'justify-content-center');
  btnShowLI.textContent = `+${contacts.length - 4}`;
  if (contacts.length < 5) {
    btnShowLI.classList.add('hidden');
  }
  btnShowLI.addEventListener('click', async () => {
    let contactLI = btnShowLI.closest('.contacts-list ').querySelectorAll('.list-item.hidden');
    contactLI.forEach((item, i) => {
      item.style = 'display: block';
      setTimeout (()=>{
        item.classList.add('shown');
      }, i * 100);
    })
    btnShowLI.classList.add('hidden');
  });
  ul.append(btnShowLI);
  return ul;
}

function translitWord(word){
  let answer = '';
  let converter = {
    'а': 'a',    'б': 'b',    'в': 'v',    'г': 'g',    'д': 'd',
    'е': 'e',    'ё': 'e',    'ж': 'zh',   'з': 'z',    'и': 'i',
    'й': 'y',    'к': 'k',    'л': 'l',    'м': 'm',    'н': 'n',
    'о': 'o',    'п': 'p',    'р': 'r',    'с': 's',    'т': 't',
    'у': 'u',    'ф': 'f',    'х': 'h',    'ц': 'c',    'ч': 'ch',
    'ш': 'sh',   'щ': 'sch',  'ь': '',     'ы': 'y',    'ъ': '',
    'э': 'e',    'ю': 'yu',   'я': 'ya',

    'А': 'A',    'Б': 'B',    'В': 'V',    'Г': 'G',    'Д': 'D',
    'Е': 'E',    'Ё': 'E',    'Ж': 'Zh',   'З': 'Z',    'И': 'I',
    'Й': 'Y',    'К': 'K',    'Л': 'L',    'М': 'M',    'Н': 'N',
    'О': 'O',    'П': 'P',    'Р': 'R',    'С': 'S',    'Т': 'T',
    'У': 'U',    'Ф': 'F',    'Х': 'H',    'Ц': 'C',    'Ч': 'Ch',
    'Ш': 'Sh',   'Щ': 'Sch',  'Ь': '',     'Ы': 'Y',    'Ъ': '',
    'Э': 'E',    'Ю': 'Yu',   'Я': 'Ya',   '.': '_',    ' ': ''
  };

  for (const element of word) {
    if (converter[element] === undefined) {
      answer += element;
    } else {
      answer += converter[element];
    }
  }

  return answer;
}

function hrefForContacts(obj) {
  switch (obj['type']) {
    case 'Телефон':
      return `tel:${obj['value']}`
    case 'Email':
      return `mailto:${obj['value']}`
    case 'Доп. телефон':
      return `tel:${obj['value']}`
    case 'Vk':
      return `https://vk.com/${obj['value']}`
    case 'Facebook':
      return `https://www.facebook.com/${obj['value']}`
    default:
      return obj['value'];
  }
}

/**
 * Delete student by id
 * @param id
 * @returns {Promise<void>}
 */
async function onDelete(id) {
  await fetch(`http://localhost:3000/api/clients/${id}`, {
    method: 'DELETE',
  })
}

/**
 * Get all rows of students
 * @param arrClients
 */
function renderClients(arrClients) {
  let tBody = document.querySelector('tbody');
  tBody.innerHTML = '';

  if (arrClients.length && Array.isArray(arrClients)) {
    let tr = '';
    for (let obj in arrClients) {
      tr = document.createElement('tr');
      renderClientItem(tr, arrClients[obj]);
      action(tr, arrClients[obj]);
      tBody.append(tr);
    }
  } else {
    let tr = document.createElement('tr');
    let td = document.createElement('td');
    td.colSpan = theadSortAndFilter( true) + 2;
    td.textContent = 'Записей не найдено';
    td.style.textAlign = 'center';
    tr.append(td);
    tBody.append(tr);
  }
  let tableClients = tBody.closest('table');
  if (!document.querySelector('button.btn-add')) {
    let btnAddDiv = document.createElement('div');
    let btnAddClient = document.createElement('button');
    btnAddDiv.classList.add('text-center');
    btnAddClient.type = 'button';
    btnAddClient.classList.add('btn', 'btn-border', 'btn-add');
    btnAddClient.innerHTML = 'Добавить клиента\n' +
      '          <svg width="23" height="16" viewBox="0 0 23 16" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
      '            <path d="M14.5 8C16.71 8 18.5 6.21 18.5 4C18.5 1.79 16.71 0 14.5 0C12.29 0 10.5 1.79 10.5 4C10.5 6.21 12.29 8 14.5 8ZM5.5 6V3H3.5V6H0.5V8H3.5V11H5.5V8H8.5V6H5.5ZM14.5 10C11.83 10 6.5 11.34 6.5 14V16H22.5V14C22.5 11.34 17.17 10 14.5 10Z"/>\n' +
      '          </svg>';
    btnAddDiv.append(btnAddClient);
    tableClients.insertAdjacentElement("afterend", btnAddDiv);
    btnAddClient.addEventListener('click', async () => {
      showLoader(btnAddClient.querySelector('svg'), 'loader-purple');
      if (!modal) return;
      modal.show();
      await renderFormOnModal({onSave});
      hideLoader(btnAddClient.querySelector('svg'), 'loader-purple');
    })
  }
}

/**
 * Action for row
 * @param tr
 * @param item
 */
function action(tr, item) {
  let lastTd = document.createElement('td');
  let actions = document.createElement('div');
  actions.classList.add('actions-list', 'd-flex', 'justify-content-start');
  lastTd.classList.add('btn-actions');
  lastTd.dataset.id = item.id;
  let btnDel = document.createElement('button');
  let btnEdit = document.createElement('button');
  let iconDel = document.createElement('span');
  let iconEdit = document.createElement('span');
  iconDel.classList.add('icon', 'delete');
  iconEdit.classList.add('icon', 'edit');
  btnDel.type = btnEdit.type = 'button';
  btnDel.textContent = 'Удалить';
  btnEdit.textContent = 'Изменить';
  btnDel.classList.add('btn', 'btn-reset', 'btn-delete');
  btnEdit.classList.add('btn', 'btn-reset', 'btn-edit');
  btnEdit.addEventListener('click',  async (e) => {
    showLoader(iconEdit, 'loader-blue');
    if (!modal) return;
    modal.show();
    await renderFormOnModal({onSave, onDelete}, item.id);
    hideLoader(iconEdit, 'loader-blue');
  });
  btnDel.addEventListener('click',  async (e) => {
    showLoader(iconDel, 'loader-red');
    if (!modal) return;
    modal.show();
    renderDeleteOnModal({onDelete}, item.id);
    hideLoader(iconDel, 'loader-red');
  });
  btnDel.append(iconDel);
  btnEdit.append(iconEdit);
  actions.append(btnEdit)
  actions.append(btnDel)
  lastTd.append(actions);
  tr.append(lastTd);
}

/**
 * Send form after valid, check
 * @type {HTMLFormElement}
 */
// let form = document.querySelector('form');
// form.addEventListener('submit', async (e) => {
//   e.preventDefault();
//   let error = false;
//   let lastTh = document.querySelector('table tbody tr:last-child th');
//   let th = document.createElement('th');
//   let obj = {};
//   th.innerHTML = lastTh ? Number(lastTh.textContent) + 1 : 1;
//   form.querySelectorAll('input').forEach((el, i, arr) => {
//     if (errorInput(el)) {
//       error = true;
//       return false;
//     } else {
//       if (!error) {
//         obj[el.id] = getValObject(el);
//       }
//     }
//   });
//   if (!error) {
//     await addClient(obj);
//     form.querySelectorAll('input').forEach((el) => el.value = '');
//     getClients().then(result => renderClients(getFormatClients(result)));
//   }
// });

/**
 * Get format of Date
 * @returns {string}
 * @param dt
 */
function formatDate(dt) {
  let date = new Date(dt);
  let dd = date.getDate();
  if (dd < 10) dd = '0' + dd;
  let mm = date.getMonth() + 1;
  if (mm < 10) mm = '0' + mm;
  let y = date.getFullYear();
  return dd + '.' + mm + '.' + y + ' <span class="date-time">' + formatTime(date) + '</span>';
}

/**
 * Get format time
 * @param date
 * @returns {string}
 */
function formatTime(date) {
  let h = date.getHours();
  let m = date.getMinutes();
  h = h % 12;
  h = h ? h : 12;
  m = m < 10 ? '0'+ m: m;
  return h + ':' + m;
}

let inputs = document.querySelectorAll('input');
/**
 * Events input
 */
inputs.forEach(function(el) {
  el.addEventListener('keydown', (e) => {
    availableInput(e);
  })
  el.addEventListener('keyup', (e) => {
    let input = e.srcElement;
    errorInput(input);
  })
});

/**
 * Check available input
 * @param e
 * @returns {boolean}
 */
function availableInput(e) {
  if (e.srcElement.id !== 'studyStart' && e.srcElement.id !== 'birthday') {
    let key = (window.event ? e.keyCode : e.which) || (e.clipboardData || window.clipboardData);
    let reg = new RegExp(/^[а-яё\s-]+$/i)
    if (reg.test(e.key) || key === 8 || key === 46
      || key === 37 || key === 39 || key === 13 || key === 9) {
      return false;
    }
    e.preventDefault();
  } else {
    if (e.keyCode === 46 || e.keyCode === 8 || e.keyCode === 9 || e.keyCode === 27 ||
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode >= 35 && e.keyCode <= 39)) {
      return false;
    } else {
      if ((e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105 )) {
        e.preventDefault();
      }
    }
  }
}

/**
 * Check to empty input
 * @param input
 */
function errorInput(input) {
  let error = false;
  let nameErr = '';
  let errorHtml = input.parentElement.querySelector('div.invalid-tooltip');
  let name = input.parentElement.querySelector('label').textContent;
  errorHtml.textContent = '';
  if (input.id === 'yearEducation') {
    if (input.value.length > 4) {
      error = true;
      nameErr = `Пожалуйста, введите не более 4 значений начало ${name}`;
    } else if (input.value.length === 0) {
      error = true;
      nameErr = `Пожалуйста введите ${name}`;
    } else if (input.value < 2000 || input.value > 2023) {
      error = true;
      nameErr = `Пожалуйста введите ${name} в диапазоне от 2000-го до текущего года`;
    }
  } else {
    if (input.value.length === 0) {
      error = true;
      nameErr = `Пожалуйста введите ${name}`;
    }
  }
  if (error) {
    errorHtml.style.display = 'block';
    input.style.borderColor = 'red';
    errorHtml.textContent = nameErr;
  } else {
    errorHtml.style.display = 'none';
    input.style.borderColor = '#ced4da';
  }
  return error;
}

/**
 * Get html th sort and filter
 * @param tHead
 * @param length
 * @returns {number}
 */
function theadSortAndFilter(length = false) {
  let tHead = document.querySelector('thead tr');
  if (tHead.children.length > 0) return;
  let headerTH = [
    ['id', 'ID', true], ['fio', 'Фамилия Имя Отчество', true],
    ['createdAt', 'Дата и время создания', true], ['updatedAt', 'Последние изменения', true],
    ['contacts', 'Контакты', false], ['actions', 'Действия', false]
  ];
  if (!length) {
    headerTH.forEach((txt) => {
      if (txt[2]) {
        let th = document.createElement('th');
        let thS = document.createElement('div');
        thS.classList.add('th-sort', 'both');
        let thF = document.createElement('div');
        thF.classList.add('th-filter');
        let inputF = document.createElement('input');
        thS.textContent = txt[1];
        thS.addEventListener('click', (e) => {
          let col = e.target;
          let sort = null;
          if (col.classList.contains('both')) {
            changeTheadSort();
            e.target.classList.remove('both');
            e.target.classList.add('asc');
            sort = false;
          } else if (col.classList.contains('asc')) {
            changeTheadSort();
            col.classList.remove('asc');
            col.classList.add('desc');
            sort = true;
          } else if (col.classList.contains('desc')) {
            changeTheadSort();
            col.classList.remove('desc');
            col.classList.add('asc');
            sort = false;
          }
          sortClients(async () => getClients(), txt[0], sort).then(result => renderClients(result));
        });
        inputF.addEventListener('keyup', (e) => {
          filterClients(async () => getClients(), txt[0], e.srcElement.value).then(result => renderClients(result));
        });
        th.append(thS);
        th.append(thF);
        tHead.append(th);
      } else {
        let lastTh = document.createElement('th');
        lastTh.textContent = txt[1];
        tHead.append(lastTh);
      }
    });
  } else {
    return headerTH.length;
  }
}

/**
 * Change html sort and filter
 */
function changeTheadSort() {
  document.querySelectorAll('.table th div.th-sort').forEach((el, i, arr) => {
    if (el.classList.contains('desc')) el.classList.remove('desc');
    if (el.classList.contains('asc')) el.classList.remove('asc');
    if (!el.classList.contains('both')) el.classList.add('both');
  })
}

/**
 * Sort by column
 * @param arr
 * @param prop
 * @param sort
 * @returns {*}
 */
const sortClients = async (arr, prop, sort = false) => {
  let res = await arr();
  return getFormatClients(res).sort((a, b) => (sort === false
  ? a[prop].toLowerCase() < b[prop].toLowerCase()
  : a[prop].toLowerCase() > b[prop].toLowerCase()) ? -1 : 1)
}

/**
 * Filter by column
 * @param arr
 * @param prop
 * @param value
 * @returns {*[]}
 */
const filterClients = async (arr, prop, value) => {
  let arrRes = await arr();
  let result = [],
    copyArr = [...getFormatClients(arrRes)];
  for(const item of copyArr) {
    if (String(item[prop].toLowerCase()).includes(value.toLowerCase()) === true) result.push(item);
  }
  return result;
}

/**
 *
 * @param onDelete
 * @param id
 */
function renderDeleteOnModal({onDelete}, id) {
  if (!id) return;
  modal._dialog.querySelector('div.modal-contacts').style = 'display:none;';
  let modalBody = modal._dialog.querySelector('div.modal-body');
  let modalTitle = modal._dialog.querySelector('h3.modal-title');
  let modalFooter = modal._dialog.querySelector('div.modal-footer');
  modalTitle.closest('.modal-header').classList.add('justify-content-center')
  modalTitle.textContent = 'Удалить клиента';

  modalBody.classList.add('text-center');
  let paragraph = document.createElement('p');
  paragraph.style = 'max-width:275px; margin: 0 auto';
  paragraph.textContent = 'Вы действительно хотите удалить данного клиента?';
  modalBody.append(paragraph);

  let btnDelete = document.createElement('button');
  let btnCancel = document.createElement('button');
  btnDelete.type = btnCancel.type = 'button';
  btnDelete.classList.add('btn', 'btn-purple', 'btn-save');
  btnDelete.textContent = 'Удалить';
  btnDelete.addEventListener('click', async () => {
    try {
      await onDelete(id);
      modal.hide();
      getClients().then(result => renderClients(getFormatClients(result)));
    } catch (error) {
      showError(error.message);
    }
  });
  btnCancel.classList.add('btn', 'btn-reset', 'btn-delete');
  btnCancel.setAttribute('data-bs-dismiss', 'modal');
  btnCancel.setAttribute('aria-label', 'Close');
  btnCancel.textContent = 'Отмена';
  modalFooter.append(btnDelete);
  modalFooter.append(btnCancel);
}

/**
 *
 * @returns {*}
 * @param contact
 * @param counter
 */
function renderContactsOnForm(contact, counter = 0, modalContacts) {
  let contacts = ['Телефон', 'Доп. телефон', 'Email', 'Vk', 'Facebook', 'Другое'];

  let contactItem = document.createElement('div');
  contactItem.classList.add('contacts-item', 'd-flex', 'flex-row', 'align-content-center', 'mb-3');
  let select = document.createElement('select');
  for (let optVal of contacts) {
    let option = document.createElement('option');
    option.value = optVal;
    option.selected = contact['type'] === optVal;
    option.textContent = optVal;
    select.append(option);
  }
  let input = document.createElement('input');
  input.type = 'text';
  input.classList.add('form-control');
  input.placeholder = 'Введите данные контакта';
  input.value = contact['value'] ?? '';
  let btnDelCont = document.createElement('button');
  btnDelCont.type = 'button';
  btnDelCont.classList.add('btn', 'btn-reset', 'btn-delete-contact');
  btnDelCont.setAttribute('data-bs-toggle', 'tooltip');
  btnDelCont.setAttribute('data-bs-custom-class', 'custom-tooltip');
  btnDelCont.setAttribute('data-bs-placement', 'top');
  btnDelCont.setAttribute('data-bs-title', 'Удалить контакт');
  btnDelCont.innerHTML = '<svg class="icon delete-contact" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
    '                  <path d="M6 0C2.682 0 0 2.682 0 6C0 9.318 2.682 12 6 12C9.318 12 12 9.318 12 6C12 2.682 9.318 0 6 0ZM6 10.8C3.354 10.8 1.2 8.646 1.2 6C1.2 3.354 3.354 1.2 6 1.2C8.646 1.2 10.8 3.354 10.8 6C10.8 8.646 8.646 10.8 6 10.8ZM8.154 3L6 5.154L3.846 3L3 3.846L5.154 6L3 8.154L3.846 9L6 6.846L8.154 9L9 8.154L6.846 6L9 3.846L8.154 3Z"/>\n' +
    '                </svg>';
  btnDelCont.addEventListener('click', () => {
    btnDelCont.closest('.contacts-item').remove();
    if (modalContacts.querySelectorAll('div.contacts-item').length < 10) {
      modalContacts.querySelector('button.btn-add-contact').style = 'display: flex;'
    }
    let tooltip = document.getElementsByClassName("tooltip");
    tooltip[0].parentNode.removeChild(tooltip[0]);
  });
  contactItem.append(select);
  contactItem.append(input);
  contactItem.append(btnDelCont);
  return contactItem;
}

/**
 *
 * @param onSave
 * @param onDelete
 * @param id
 * @returns {Promise<void>}
 */
const renderFormOnModal = async ({onSave, onDelete}, id = false) => {
  let resClient;
  if (id) {
    const fnClient = async () => getClientByID(id);
    resClient = await fnClient();
  }
  let inputsForm = [['surname', 'Фамилия'], ['name', 'Имя'], ['lastName', 'Отчество']];

  //let form = modal._dialog.querySelector('form');
  let modalHeader = modal._dialog.querySelector('div.modal-header');
  let modalTitle = modalHeader.querySelector('h3');
  modalTitle.textContent = id ? 'Изменить данные': 'Новый клиент';
  if (resClient) {
    let idName = document.createElement('span');
    idName.classList.add('id-name', 'ms-2');
    idName.textContent = 'ID: ' + resClient.id;
    modalTitle.append(idName);
  }
  let modalBody = modal._dialog.querySelector('div.modal-body');
  let modalContacts = modal._dialog.querySelector('div.modal-contacts');
  let modalFooter = modal._dialog.querySelector('div.modal-footer');

  inputsForm.map((item, i, arr) => {
    let inputDiv = document.createElement('div');
    let label = document.createElement('label');
    let lbRequired = document.createElement('span');
    let input = document.createElement('input');
    inputDiv.classList.add('form-floating', 'mb-3');
    input.type = 'text';
    input.classList.add('form-control');
    input.placeholder = item[1];
    input.name = item[0];
    input.value = resClient ? typeof resClient[item[0]] !== "undefined" ? resClient[item[0]] : '' : '';
    input.id = item[0];
    label.textContent = item[1];
    label.setAttribute('for', item[1]);
    lbRequired.textContent = '*';
    inputDiv.append(input);
    inputDiv.append(label);
    modalBody.append(inputDiv);
  })
  let btnAddCont = document.createElement('button');
  btnAddCont.classList.add('btn', 'btn-reset', 'btn-add-contact');
  btnAddCont.type = 'button';
  btnAddCont.textContent = 'Добавить контакт';
  let iconBtn = document.createElement('span');
  iconBtn.classList.add('icon', 'add-contact');
  btnAddCont.append(iconBtn);
  modalContacts.append(btnAddCont);
  if (resClient && typeof resClient.contacts === 'object') {
    for (let i = 0; i < resClient.contacts.length; i++) {
      btnAddCont.insertAdjacentElement('beforebegin', renderContactsOnForm(resClient.contacts[i], i, modalContacts));
    }
    $('select').select2(options);
  }
  btnAddCont.addEventListener('click', () => {
    let contactItem = modalContacts.querySelectorAll('div.contacts-item');
    btnAddCont.insertAdjacentElement('beforebegin', renderContactsOnForm(false,
      contactItem ? contactItem.length++ : 0, modalContacts));
    $('select').select2(options);
    if (contactItem.length === 9) {
      btnAddCont.style = 'display:none;';
    }
  });
  let btnSave = document.createElement('button');
  let btnDelOrCancel = document.createElement('button');
  let btnIcon = document.createElement('span');
  btnSave.type = 'submit';
  btnDelOrCancel.type = 'button';
  btnSave.classList.add('btn', 'btn-purple', 'btn-save');
  btnSave.textContent = 'Сохранить';
  btnSave.append(btnIcon);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoader(btnIcon, 'loader-purple');
    let data = new FormData(form);
    let obj = Object.fromEntries(data.entries());
    let arrContact = [];
    modalContacts.querySelectorAll('div.contacts-item').forEach((item) => {
      arrContact.push({
        type: item.querySelector('select').value,
        value: item.querySelector('input').value
      });
    });
    obj.contacts = arrContact
    try {
      await onSave(obj, id);
      modal.hide();
      getClients().then(result => renderClients(getFormatClients(result)));
    } catch (error) {
      showError(error.message);
    }
    Object.keys(obj).forEach(key => delete obj[key]);
  })
  btnDelOrCancel.classList.add('btn', 'btn-reset', 'btn-delete');
  if (!resClient) {
    btnDelOrCancel.setAttribute('data-bs-dismiss', 'modal');
    btnDelOrCancel.setAttribute('aria-label', 'Close');
  } else {
    btnDelOrCancel.addEventListener('click', async () => {
      try {
        await onDelete(resClient.id);
        modal.hide();
        getClients().then(result => renderClients(getFormatClients(result)));
      } catch (error) {
        showError(error.message);
      }
    });
  }
  btnDelOrCancel.textContent = resClient ? 'Удалить клиента': 'Отмена';
  modalFooter.append(btnSave);
  modalFooter.append(btnDelOrCancel);
}

/**
 * Save data to server
 * @param obj
 * @param id
 * @returns {Promise<void>}
 */
const onSave = async (obj, id = false) => {
  await fetch(`http://localhost:3000/api/clients/${id === false ? '': id}`, {
    method: id === false ? 'POST' : 'PATCH',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(obj)
  }).then(result => {
    handleError(result);
  });
}

/**
 * Show Loader
 * @param el
 * @param pos
 * @returns {boolean}
 */
function showLoader(el, pos) {
  let loader = document.createElement('span');
  loader.classList.add('loader', pos);
  if (pos === 'loader-big') {
    let tr = document.createElement('tr');
    let td = document.createElement('td');
    td.colSpan = 6;
    td.style = 'text-align:center;padding: 50px 0;';
    td.append(loader);
    tr.append(td);
    el.append(tr);
    return false;
  } else {
    el.classList.add('loader', 'loader-sm', pos);
  }
}

/**
 * Hide Loader
 * @param el
 * @param pos
 */
function hideLoader(el, pos) {
  setTimeout(() => {
    el.classList.remove('loader', 'loader-sm', pos);
  }, 200)
}


/**
 * Handling error
 * @param error
 */
function handleError(error) {
  if (error.status === 200) return;
  let err;
  if (error.status === 404) {
    err = new Error('Запрошенный URL был не найден на веб-сервере.\n');
  } else if (error.status === 422) {
    err = new Error('Проверьте код на наличие ошибок.\n');
  } else if (error.status >= 500) {
    err = new Error(error.statusText);
  }
  err.statusCode = error.status ?? error;
  throw err;
}

/**
 * Show error after request on server
 * @param message
 */
function showError(message) {
  let pos = modal._dialog.querySelector('button.btn-save');
  let errorBlock = document.createElement('span');
  errorBlock.classList.add('error-text');
  errorBlock.textContent = message;
  pos.insertAdjacentElement('beforebegin', errorBlock);
}

/**
 * Close modal and clear content
 */
modalDom.addEventListener('hidden.bs.modal', () => {
  document.querySelector('button.btn-edit').removeEventListener('click', onSave);
  form.removeEventListener('submit', onSave);
  //modal._dialog.querySelector('button.btn-save').removeEventListener('click',{}, false);
  //modal._dialog.querySelector('button.btn-delete').removeEventListener('click', {}, false);
  modal._dialog.querySelector('div.modal-footer').innerHTML = '';
  modal._dialog.querySelector('div.modal-body').innerHTML = '';
  modal._dialog.querySelector('div.modal-header').classList.remove('justify-content-center');
  let modalContacts = modal._dialog.querySelector('div.modal-contacts');
  modalContacts.innerHTML = '';
  modalContacts.style = 'display:block;';
})
