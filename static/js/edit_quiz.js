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
      question.answer = document.getElementById(
        `question-${question.id}-answer-text`
      ).innerText;
    } else if (question.type == 'radio') {
      for (let option of question.options) {
        option.text = document.getElementById(
          `question-${question.id}-option-${option.id}-text`
        ).innerText;
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
