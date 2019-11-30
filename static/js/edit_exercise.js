// TODO: Lisa kõik ühte Javascript-objekti!

const updateVariable = id => {
  const name = document.getElementById('variable-name-' + id).innerText;
  const unit = document.getElementById('variable-unit-' + id).innerText;
  const min = document.getElementById('variable-min-' + id).innerText;
  const max = document.getElementById('variable-max-' + id).innerText;

  document.getElementById('update_variable_modal_name').value = name;
  document.getElementById('update_variable_modal_unit').value = unit;
  document.getElementById('update_variable_modal_min').value = min;
  document.getElementById('update_variable_modal_max').value = max;

  document.getElementById('update_variable_modal_save').onclick = () =>
    saveVariable(id);
};

const saveVariable = id => {
  const name = document.getElementById('update_variable_modal_name').value;
  const unit = document.getElementById('update_variable_modal_unit').value;
  const min = document.getElementById('update_variable_modal_min').value;
  const max = document.getElementById('update_variable_modal_max').value;

  document.getElementById('variable-name-' + id).innerText = name;
  document.getElementById('variable-unit-' + id).innerText = unit;
  document.getElementById('variable-min-' + id).innerText = min;
  document.getElementById('variable-max-' + id).innerText = max;

  document.getElementById('update_variable_modal_name').value = '';
  document.getElementById('update_variable_modal_unit').value = '';
  document.getElementById('update_variable_modal_min').value = '';
  document.getElementById('update_variable_modal_max').value = '';

  document.getElementById('update_variable_modal_save').onclick = () =>
    saveVariable();

  for (let vid in exercise.variables) {
    if (exercise.variables[vid].id == id) {
      exercise.variables[vid] = {
        name,
        unit,
        min,
        max
      };
    }
  }
};

const discardVariable = () => {
  document.getElementById('update_variable_modal_name').value = '';
  document.getElementById('update_variable_modal_unit').value = '';
  document.getElementById('update_variable_modal_min').value = '';
  document.getElementById('update_variable_modal_max').value = '';

  document.getElementById('new_variable_modal_name').value = '';
  document.getElementById('new_variable_modal_unit').value = '';
  document.getElementById('new_variable_modal_min').value = '';
  document.getElementById('new_variable_modal_max').value = '';

  document.getElementById('update_variable_modal_save').onclick = () =>
    saveVariable();
  document.getElementById('new_variable_modal_save').onclick = () =>
    createVariable();
};

const newVariable = () => {
  const id = Math.floor(Math.random() * 5000);

  document.getElementById('new_variable_modal_save').onclick = () =>
    createVariable(id);
};

const createVariable = id => {
  const data = {
    name: document.getElementById('new_variable_modal_name').value,
    unit: document.getElementById('new_variable_modal_unit').value,
    min: document.getElementById('new_variable_modal_min').value,
    max: document.getElementById('new_variable_modal_max').value,
    id
  };

  exercise.variables.push(data);

  const tr = document.createElement('tr');
  tr.id = 'variable-details-' + id;

  for (let heading of ['name', 'unit', 'min', 'max']) {
    const td = document.createElement('td');
    td.id = 'variable-' + heading + '-' + id;
    td.innerText = data[heading];
    tr.appendChild(td);
  }

  let td = document.createElement('td');
  let a = document.createElement('a');
  let i = document.createElement('i');
  a.className = 'modal-trigger';
  a.href = '#update_variable_modal';
  a.onclick = () => updateVariable(id);
  i.className = 'material-icons manage-edit';
  i.innerText = 'edit';
  a.appendChild(i);
  td.appendChild(a);

  a = document.createElement('a');
  i = document.createElement('i');
  a.className = 'manage-button';
  a.onclick = () => deleteVariable(id);
  i.className = 'material-icons manage-delete';
  i.innerText = 'delete';
  a.appendChild(i);
  td.appendChild(a);

  tr.appendChild(td);

  document.getElementById('variables_body').appendChild(tr);

  document.getElementById('new_variable_modal_save').onclick = () =>
    createVariable();

  document.getElementById('new_variable_modal_name').value = '';
  document.getElementById('new_variable_modal_unit').value = '';
  document.getElementById('new_variable_modal_min').value = '';
  document.getElementById('new_variable_modal_max').value = '';
};

const deleteVariable = id => {
  const tr = document.getElementById('variable-details-' + id);
  document.getElementById('variables_body').removeChild(tr);

  const variables = [];
  for (let vid in exercise.variables) {
    if (exercise.variables[vid].id != id) {
      variables.push(exercise.variables[vid]);
    }
  }

  exercise.variables = variables;
};

const updateVariant = id => {
  const text = document.getElementById('variant-text-' + id).innerText;
  const formula = document.getElementById('variant-formula-' + id).innerText;

  document.getElementById('update_variant_modal_text').value = text;
  document.getElementById('update_variant_modal_formula').value = formula;

  document.getElementById('update_variant_modal_save').onclick = () =>
    saveVariant(id);
};

const saveVariant = id => {
  const text = document.getElementById('update_variant_modal_text').value;
  const formula = document.getElementById('update_variant_modal_formula').value;

  document.getElementById('variant-text-' + id).innerText = text;
  document.getElementById('variant-formula-' + id).innerText = formula;

  document.getElementById('update_variant_modal_text').value = '';
  document.getElementById('update_variant_modal_formula').value = '';

  document.getElementById('update_variant_modal_save').onclick = () =>
    saveVariant();

  for (let vid in exercise.variants) {
    if (exercise.variants[vid].id == id) {
      exercise.variants[vid] = {
        name,
        formula
      };
    }
  }
};

const discardVariant = () => {
  document.getElementById('update_variant_modal_text').value = '';
  document.getElementById('update_variant_modal_formula').value = '';

  document.getElementById('new_variant_modal_text').value = '';
  document.getElementById('new_variant_modal_formula').value = '';

  document.getElementById('update_variant_modal_save').onclick = () =>
    saveVariant();
  document.getElementById('new_variant_modal_save').onclick = () =>
    createVariant();
};

const newVariant = () => {
  const id = Math.floor(Math.random() * 5000);

  document.getElementById('new_variant_modal_save').onclick = () =>
    createVariant(id);
};

const createVariant = id => {
  const data = {
    text: document.getElementById('new_variant_modal_text').value,
    formula: document.getElementById('new_variant_modal_formula').value,
    id
  };

  exercise.variants.push(data);

  const tr = document.createElement('tr');
  tr.id = 'variant-details-' + id;

  for (let heading of ['text', 'formula']) {
    const td = document.createElement('td');
    td.id = 'variant-' + heading + '-' + id;
    td.innerText = data[heading];
    tr.appendChild(td);
  }

  let td = document.createElement('td');
  let a = document.createElement('a');
  let i = document.createElement('i');
  a.className = 'modal-trigger';
  a.href = '#update_variant_modal';
  a.onclick = () => updateVariant(id);
  i.className = 'material-icons manage-edit';
  i.innerText = 'edit';
  a.appendChild(i);
  td.appendChild(a);

  a = document.createElement('a');
  i = document.createElement('i');
  a.className = 'manage-button';
  a.onclick = () => deleteVariant(id);
  i.className = 'material-icons manage-delete';
  i.innerText = 'delete';
  a.appendChild(i);
  td.appendChild(a);

  tr.appendChild(td);

  document.getElementById('variants_body').appendChild(tr);

  document.getElementById('new_variant_modal_save').onclick = () =>
    createVariable();

  document.getElementById('new_variant_modal_text').value = '';
  document.getElementById('new_variant_modal_formula').value = '';
};

const deleteVariant = id => {
  const tr = document.getElementById('variant-details-' + id);
  document.getElementById('variants_body').removeChild(tr);

  const variants = [];
  for (let vid in exercise.variants) {
    if (exercise.variants[vid].id != id) {
      variants.push(exercise.variants[vid]);
    }
  }

  exercise.variants = variants;
};

const save = () => {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = '/admin/save_exercise';

  const input = document.createElement('input');
  input.type = 'hidden';
  (input.name = 'exercise'), (input.value = JSON.stringify(exercise));

  form.appendChild(input);

  document.getElementsByTagName('body')[0].appendChild(form);

  form.submit();
};

const switchPublished = () => {
  exercise.published = !exercise.published;
  document.getElementById('published_toggle').innerText = exercise.published
    ? 'toggle_on'
    : 'toggle_off';
  document.getElementById('published_toggle_a').className = exercise.published
    ? 'manage-launch'
    : 'manage-delete';
};
