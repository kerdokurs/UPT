const ctrlEnterSave = (id, cb) => {
  $(id).keydown(e => {
    if (e.ctrlKey && e.keyCode == 13) cb();
  });
};
