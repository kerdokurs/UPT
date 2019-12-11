const switchCaseSensitive = questionId => {
  for (let question of quiz.questions) {
    if (question && question.id == questionId) {
      if (question.type == 'field') {
        question.case_sensitive = !question.case_sensitive;

        const toggle = document.getElementById(
          `question-${questionId}-case_sensitive_toggle`
        );
        toggle.innerText = question.case_sensitive ? 'toggle_on' : 'toggle_off';
        toggle.className = `material-icons manage-${
          question.case_sensitive ? 'launch' : 'delete'
        }`;
      }

      break;
    }
  }
};

const radioCorrect = (questionId, optionId) => {
  for (let question of quiz.questions) {
    if (question && question.id == questionId) {
      if (question.type == 'radio') {
        question.answer = optionId;
        for (let option of question.options) {
          const toggle = document.getElementById(
            `question-${question.id}-option-${option.id}-correct_toggle`
          );
          toggle.className = `material-icons manage-${
            option.id == optionId ? 'launch' : 'delete'
          }`;
        }
      }

      break;
    }
  }
};

const save = () => {
  for (let question of quiz.questions) {
    if (question.type == 'field') {
      const div = document.getElementById(
        `question-${question.id}-answer-text`
      );
      if (div != null) question.answer = div.innerText;
    } else if (question.type == 'radio') {
      for (let option of question.options) {
        const div = document.getElementById(
          `question-${question.id}-option-${option.id}-text`
        );

        if (div != null) option.text = div.innerText;
      }
    }
  }

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = '/admin/save_exercise';

  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'exercise';
  input.value = JSON.stringify(quiz);

  form.appendChild(input);

  document.getElementsByTagName('body')[0].appendChild(form);

  form.submit();
};

const switchPublished = () => {
  quiz.published = !quiz.published;
  document.getElementById('published_toggle').innerText = quiz.published
    ? 'toggle_on'
    : 'toggle_off';
  document.getElementById('published_toggle').className = quiz.published
    ? 'material-icons manage-launch'
    : 'material-icons manage-delete';
};

const newOption = questionId => {
  const optionId = Math.floor(Math.random() * 5000);

  const html = `
  <span>
    <span contenteditable="true" id="question-${questionId}-option-${optionId}-text">
      muuda...
    </span>
  </span>
  <span>
    <a onclick="radioCorrect(${questionId}, ${optionId})" class="manage-default"
      id="question-${questionId}-option-${optionId}-correct">
      <i class="material-icons manage-delete"
        id="question-${questionId}-option-${optionId}-correct_toggle">check_circle_outline</i>
    </a>
  </span><br>
  `;

  for (let question of quiz.questions)
    if (question.id == questionId)
      question.options.push({ id: optionId, text: 'muuda...' });

  const div = document.createElement('div');
  div.innerHTML = html;

  document.getElementById(`question-${questionId}-options`).appendChild(div);
};

const newQuestion = () => {};

const createQuestion = () => {
  const id = Math.floor(Math.random() * 5000);

  const question = document.getElementById('new_question_modal_question').value;
  const type = document.getElementById('new_question_modal_type').value;
  const points = document.getElementById('new_question_modal_points').value;

  const obj = {
    id,
    question,
    type,
    points
  };

  if (type == 'field') {
    obj.case_sensitive = false;
    obj.answer = 'muuda...';
  } else if (type == 'radio') {
    const optionId = Math.floor(Math.random() * 5000);

    obj.answer = optionId;
    obj.options = [{ id: optionId, text: 'muuda...' }];
  }

  quiz.questions.push(obj);

  save();
};
