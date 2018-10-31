const bookmark = type => {
  const title = document.title;
  const tokens = title.split(' - ');

  const pathname = window.location.pathname;
  const ids = pathname.substring(1).split('/');

  const urls = pathname.substring(1).split('/');
  urls.shift();

  let url = '';
  let data = {};
  if (type == 1) {
    url = '/bookmarks/set';
    data = {
      title: escape(tokens[0] + ' - ' + tokens[1]),
      url: escape(urls.join('/'))
    };
  } else {
    url = '/bookmarks/del';
  }

  data.id = ids[1] + '-' + ids[2];

  $.ajax({
    type: 'POST',
    url,
    data,
    success: data => {
      console.log(data);
      data = JSON.parse(data);

      switch (data.status) {
        case 0:
          alert('Järjehoidja lisatud!');
          $('#bookmark-action').attr('onclick', 'bookmark(0)');
          $('#bookmark-icon').text('bookmark');
          break;
        case 1:
          alert('Järjehoidja eemaldatud!');
          $('#bookmark-action').attr('onclick', 'bookmark(1)');
          $('#bookmark-icon').text('bookmark_border');
          break;
        case -1:
          alert('Järjehoidja on juba olemas!');
          break;
        case -2:
          alert('Parameetrid puuduvad!');
          break;
        case -3:
          alert('Järjehoidjat ei leitud!');
          break;
      }
    }
  });
};

const removeFromList = (url, title, id) => {
  const accept = confirm(`Kindel, et kustutada ${title}?`);
  if (!accept) return;

  const ids = url.split('/');

  const data = {
    id: ids[0] + '-' + ids[1]
  };

  $.ajax({
    type: 'POST',
    url: '/bookmarks/del',
    data,
    success: data => {
      console.log(data);
      data = JSON.parse(data);

      switch (data.status) {
        case 1:
          alert('Järjehoidja eemaldatud!');
          $('#bookmark-' + id).remove();
          break;
        case -2:
          alert('Parameetrid puuduvad!');
          break;
        case -3:
          alert('Järjehoidjat ei leitud!');
          break;
      }
    }
  });
};
