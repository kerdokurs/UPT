const feedback = form => {
  const name = form.name.value;
  const text = form.text.value;

  $.ajax({
    type: 'POST',
    url: '/feedback',
    data: { name, text },
    success: data => {
      data = JSON.parse(data);

      if (data.status === 0) {
        alert('Tagasiside edastatud!');
        form.name.value = '';
        form.text.value = '';
      } else {
        alert('Tehniline viga, proovige hiljem uuesti!');
      }
    }
  });
};
